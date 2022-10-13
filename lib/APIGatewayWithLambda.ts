import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {Function} from "aws-cdk-lib/aws-lambda";
import {LambdaIntegration, RestApi} from "aws-cdk-lib/aws-apigateway";

interface Props {
    path: string
    handler: string
    restApiName:string,
    description: string,
    method: string
    envVars: Record<string, string>
}

export class APIGatewayWithLambda extends Construct {
    public handler: Function;
    public api: RestApi;
    public lambdaIntegration: LambdaIntegration;

    constructor(scope: Construct, id: string, {path, handler, restApiName, method, description, envVars}: Props) {
        super(scope, id);

        this.handler = new lambda.Function(this, `${id}-lambda`, {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset(path),
            handler: handler,
            environment: {
                ...envVars
            }
        });

        this.api = new apigateway.RestApi(this, `${id}-api`, {
            restApiName,
            description,
            defaultCorsPreflightOptions: {
                allowHeaders: ['*'],
                allowMethods: ['*'],
                allowOrigins: ['*'],
            }
        });

        this.lambdaIntegration = new apigateway.LambdaIntegration(this.handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        this.api.root.addMethod(method, this.lambdaIntegration); // Post /
    }
}