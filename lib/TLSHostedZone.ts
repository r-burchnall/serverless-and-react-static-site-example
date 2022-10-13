import { Construct } from "constructs";
import cdk from "aws-cdk-lib";
import {HostedZone} from "aws-cdk-lib/aws-route53";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager/lib/certificate";

export class TLSHostedZone extends Construct {
    public hostedZone: HostedZone;
    public cert: Certificate;

    constructor(scope: Construct, id: string, domainName: string) {
        super(scope, id);

        this.hostedZone = new cdk.aws_route53.HostedZone(this, `${id}-hosted-zone`, { zoneName: domainName });
        this.cert = new cdk.aws_certificatemanager.Certificate(this, `${id}-certificate`, {
            domainName: '*' + domainName,
            validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(this.hostedZone),
        });
    }
}