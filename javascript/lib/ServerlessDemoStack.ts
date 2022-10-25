import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {ReactStaticClient} from './ReactStaticClient';
import {APIGatewayWithLambda} from './APIGatewayWithLambda';
import {aws_iam} from "aws-cdk-lib";

type Env = 'uat' | 'staging' | 'production'

export class ServerlessDemoStack extends cdk.Stack {
  private staticSite: ReactStaticClient;
  private dispatchLambda: APIGatewayWithLambda;

  constructor(scope: Construct, id: string, env: Env, props?: cdk.StackProps) {
    super(scope, id, props);

    this.staticSite = new ReactStaticClient(this, `react-static-client-${env}`, {
      env: env,
    })

    this.dispatchLambda = new APIGatewayWithLambda(this, `dispatch-feedback-email-lambda-${env}`, {
      path: 'src/lambda-functions',
      handler: 'DispatchEmail.main',
      restApiName: 'Dispatch Feedback Lambda',
      description: 'This service sends emails for feedback.',
      method: 'POST',
      envVars: {
        EMAIL_ADDRESS: process.env.EMAIL_ADDRESS ?? 'no-reply.example.com'
      }
    })

    this.dispatchLambda.handler.role?.attachInlinePolicy(new aws_iam.Policy(this, 'ses-permission', {
      policyName: 'send-email',
      statements: [
        new aws_iam.PolicyStatement({
          actions: ['ses:SendEmail'],
          resources: ['arn:aws:ses:*']
        })
      ]
    }))
  }
}
