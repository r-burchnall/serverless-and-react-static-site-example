import os.path
from os import path

import aws_cdk.aws_s3
from aws_cdk import (
    Stack,
    aws_s3,
    aws_apigateway as apigateway,
    aws_lambda as lambda_,
    aws_signer as signer
)
from constructs import Construct


class PythonStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        signing_profile = signer.SigningProfile(self, "SigningProfile",
                                                platform=signer.Platform.AWS_LAMBDA_SHA384_ECDSA
                                                )

        code_signing_config = lambda_.CodeSigningConfig(self, "CodeSigningConfig",
                                                        signing_profiles=[signing_profile]
                                                        )

        backend = lambda_.Function(self, "Function",
                                   function_name='ross-serverless-feedback',
                                   description='part of serverless training, expected to recieve a POST event from an API gateway',
                                   code_signing_config=code_signing_config,
                                   runtime=lambda_.Runtime.NODEJS_16_X,
                                   handler="index.handler",
                                   code=lambda_.Code.from_asset(path=path.join(os.getcwd(), "lambda_handler"))
                                   )

        api = apigateway.LambdaRestApi(self, "myapi",
                                       handler=backend,
                                       proxy=False
                                       )

        method = api.root.add_method("POST")  # POST /

        bucket = aws_s3.Bucket(self, "bucket",
                               bucket_name="www.ross-serverless-python-feedback-form.com",
                               public_read_access=True,
                               website_index_document="index.html",
                               versioned=False,
                               website_error_document="index.html",
                               access_control=aws_s3.BucketAccessControl.PUBLIC_READ,
                               cors=[
                                   aws_cdk.aws_s3.CorsRule(
                                       allowed_methods=[aws_s3.HttpMethods.GET],
                                       allowed_headers=['*'],
                                       allowed_origins=['*'],
                                       max_age=3000
                                   )
                               ],
                               removal_policy=aws_cdk.RemovalPolicy.DESTROY
                               )

        react_path = path.join(os.getcwd(), '../javascript/build')
        aws_cdk.aws_s3_deployment.BucketDeployment(self,
                                                   "bucket-deployment",
                                                   destination_bucket=bucket,
                                                   sources=[aws_cdk.aws_s3_deployment.Source.asset(path=react_path)],
                                                   retain_on_delete=False,
                                                   )
