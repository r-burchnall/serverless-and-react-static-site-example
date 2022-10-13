import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {ReactStaticClient} from './ReactStaticClient';
import {DispatchEmailLambda} from './DispatchEmailLambda';
import {TLSHostedZone} from './TLSHostedZone';

type Env = 'uat' | 'staging' | 'production'

export class ServerlessDemoStack extends cdk.Stack {
  private staticSite: ReactStaticClient;
  private dispatchLambda: DispatchEmailLambda;
  private TLSHostedZone: TLSHostedZone

  constructor(scope: Construct, id: string, env: Env, props?: cdk.StackProps) {
    super(scope, id, props);

    this.TLSHostedZone = new TLSHostedZone(this, `ross-feedback-site-${env}`, 'ross-feedback-form.gg')
    this.staticSite = new ReactStaticClient(this, `react-static-client-${env}`, {
      env: env,
      hostedZone: this.TLSHostedZone.hostedZone,
      cert: this.TLSHostedZone.cert,
    })
    this.dispatchLambda = new DispatchEmailLambda(this, `dispatch-feedback-email-lambda-${env}`, {
      path: 'src/lambda-functions',
      handler: 'DispatchEmail.main',
      restApiName: 'Dispatch Feedback Lambda',
      description: 'This service sends emails for feedback.',
      method: 'POST',
    })
  }
}
