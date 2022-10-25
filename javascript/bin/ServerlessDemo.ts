#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessDemoStack } from '../lib/ServerlessDemoStack';

type Env = "uat" | "staging" | "production"

if (!['uat', 'staging', 'production'].includes(process.env.ENV ?? "")) {
  throw Error(
      'The environment must be set to either "uat", "staging", "production"',
  )
}

const app = new cdk.App();
new ServerlessDemoStack(app, 'ServerlessDemoStack', process.env.ENV as Env, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});