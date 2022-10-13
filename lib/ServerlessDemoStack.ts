import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {ReactStaticClient} from "./ReactStaticClient";
import {DispatchEmailLambda} from "./DispatchEmailLambda";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager/lib/certificate";

type Env = "uat" | "staging" | "production"

export class ServerlessDemoStack extends cdk.Stack {
  private staticSite: ReactStaticClient;
  private dispatchLambda: DispatchEmailLambda;

  constructor(scope: Construct, id: string, env: Env, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = new cdk.aws_route53.HostedZone(this, 'Ross Feedback Hosted Zone', { zoneName: "ross-feedback-form.gg" });
    const cert: Certificate = new cdk.aws_certificatemanager.Certificate(this, 'Certificate', {
      domainName: '*.ross-feedback-form.gg',
      validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
    });

    this.staticSite = new ReactStaticClient(this, 'react-static-client', {
      env: env,
      hostedZone: hostedZone,
      cert: cert,
    })
    this.dispatchLambda = new DispatchEmailLambda(this, 'dispatch-feedback-email-lambda', env)
  }
}
