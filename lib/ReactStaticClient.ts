import { Construct } from "constructs";
import {
    AssetHashType, aws_certificatemanager,
    aws_cloudfront, aws_cloudfront_origins, aws_iam,
    aws_route53,
    aws_s3,
    aws_s3_deployment,
    CfnOutput,
    RemovalPolicy
} from "aws-cdk-lib";
import * as path from "path";
import {CnameRecord, HostedZone} from "aws-cdk-lib/aws-route53";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager/lib/certificate";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {Distribution} from "aws-cdk-lib/aws-cloudfront";

type Env = "uat" | "staging" | "production"

type Props = {
    env: Env,
    hostedZone: HostedZone,
    cert: Certificate
}

export class ReactStaticClient extends Construct {
    public hostingBucket: Bucket;
    public distribution: Distribution;
    public cname: CnameRecord;

    constructor(scope: Construct, id: string, {env, hostedZone, cert}: Props) {
        super(scope, id);

        const policies = {
            bucket: {
                allAccess: {} as aws_iam.ManagedPolicy,
            },
        }

        const bucketNameMap: Record<Env, string> = {
            uat: 'uat.' + hostedZone.zoneName,
            staging: 'staging.' + hostedZone.zoneName,
            production: 'www.' + hostedZone.zoneName,
        }

        this.hostingBucket = new aws_s3.Bucket(
            this,
            `${id}-client-bucket`,
            {
                bucketName: bucketNameMap[env],
                publicReadAccess: true,
                websiteIndexDocument: 'index.html',
                versioned: true,
                websiteErrorDocument: 'index.html',
                accessControl: aws_s3.BucketAccessControl.PUBLIC_READ,
                cors: [
                    {
                        allowedMethods: [
                            aws_s3.HttpMethods.GET,
                            aws_s3.HttpMethods.POST,
                            aws_s3.HttpMethods.PUT,
                            aws_s3.HttpMethods.DELETE,
                            aws_s3.HttpMethods.HEAD,
                        ],
                        allowedOrigins: ['*'],
                        allowedHeaders: ['*'],
                        maxAge: 3000,
                    },
                ],
                removalPolicy: RemovalPolicy.DESTROY,
            },
        )

        policies.bucket.allAccess = new aws_iam.ManagedPolicy(
            this,
            `${id}-client-write-policy`,
            {
                managedPolicyName: `${id}-client-bucket-all-access`,
                document: aws_iam.PolicyDocument.fromJson({
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Sid: 'ListObjectsInBucket',
                            Effect: 'Allow',
                            Action: ['s3:ListBucket'],
                            Resource: [this.hostingBucket.bucketArn],
                        },
                        {
                            Sid: 'AllObjectActions',
                            Effect: 'Allow',
                            Action: 's3:*Object*',
                            Resource: [this.hostingBucket.bucketArn],
                        },
                    ],
                }),
            },
        )

        const dir = path.join(__dirname, '../build')
        console.log('The target dir is', dir)
        new aws_s3_deployment.BucketDeployment(this, `${id}-website`, {
            sources: [
                aws_s3_deployment.Source.asset(dir, {
                    assetHash: `${id}-` + new Date().toISOString(),
                    assetHashType: AssetHashType.CUSTOM,
                }),
            ],
            destinationBucket: this.hostingBucket,
        })

        const domainMap: Record<string, string> = {
            uat: 'uat',
            staging: 'staging',
            production: 'www',
        }

        // Create Distribution with cert, default object, custom error response
        this.distribution = new aws_cloudfront.Distribution(
            this,
            `${id}-cf-distribution`,
            {
                defaultBehavior: {
                    origin: new aws_cloudfront_origins.S3Origin(this.hostingBucket),
                    cachePolicy: aws_cloudfront.CachePolicy.CACHING_DISABLED,
                },
                defaultRootObject: 'index.html',
                domainNames: [bucketNameMap[env]],
                certificate: cert,
                errorResponses: [{ httpStatus: 404, responsePagePath: '/index.html' }],
            },
        )

        // Create CNAME
        console.log(
            `Attempting to use the domain name of ${domainMap[env]} as cname for client`,
        )

        this.cname = new aws_route53.CnameRecord(this, `${id}-cname`, {
            recordName: domainMap[env],
            domainName: this.distribution.distributionDomainName,
            zone: hostedZone,
        })

        new CfnOutput(this, `${id}-client-bucket-all-access-policy-output`, {
            exportName: `${id}-client-bucket-all-access-policy-arn`,
            value: policies.bucket.allAccess.managedPolicyArn,
        })
    }
}