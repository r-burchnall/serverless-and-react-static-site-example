import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

type Env = "uat" | "staging" | "production"

export class DispatchEmailLambda extends Construct {
    constructor(scope: Construct, id: string, env: Env) {
        super(scope, id);

        const handler = new lambda.Function(this, "DispatchFeedbackLambda", {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset("src/lambda-functions"),
            handler: "DispatchEmail.main",
        });

        const api = new apigateway.RestApi(this, "dispatch-feedback-api", {
            restApiName: "Dispatch Feedback Lambda",
            description: "This service sends emails for feedback."
        });

        const getWidgetsIntegration = new apigateway.LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        api.root.addMethod("GET", getWidgetsIntegration); // GET /
    }
}