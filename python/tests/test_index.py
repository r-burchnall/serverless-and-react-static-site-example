import json
from unittest import TestCase

from aws_lambda_typing import responses, events

from lambda_handler import index


class TestLambdaHandler(TestCase):
    def test_handler_httpGetMethod(self):
        event: events.APIGatewayProxyEventV1 = {
            'path': '/',
            'httpMethod': 'GET',
        }

        got = index.handler(event, {})

        want: responses.api_gateway_proxy.APIGatewayProxyResponseV1 = {
            'body': "Bad request, was expecting a POST request to /, but got 'GET' and /",
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'multiValueHeaders': {},
            'statusCode': 400
        }

        self.assertEqual(got, want)

    def test_handler_path(self):
        event: events.APIGatewayProxyEventV1 = {
            'path': '/something-other-than-root',
            'httpMethod': 'POST',
        }

        got = index.handler(event, {})

        want: responses.api_gateway_proxy.APIGatewayProxyResponseV1 = {
            'body': "Bad request, was expecting a POST request to /, but got 'POST' and /something-other-than-root",
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'multiValueHeaders': {},
            'statusCode': 400
        }

        self.assertEqual(got, want)

    def test_handler_invalidBody(self):
        event: events.APIGatewayProxyEventV1 = {
            'path': '/',
            'httpMethod': 'POST',
            'body': json.dumps(
                {
                    "email": "ross.burchnall@and.digital",
                    "name": "ross burchnall",
                    "feedback": "this is some feedback"
                }
            ),
            'resource': '',
            'requestContext': '',
            'headers': '',
            'multiValueHeaders': '',
            'queryStringParameters': '',
            'multiValueQueryStringParameters': '',
            'pathParameters': '',
            'stageVariables': '',
            'isBase64Encoded': '',
        }

        got = index.handler(event, {})

        want: responses.api_gateway_proxy.APIGatewayProxyResponseV1 = {
            'body': "Bad request, was expecting a POST request to /, but got 'POST' and /something-other-than-root",
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'multiValueHeaders': {},
            'statusCode': 400
        }

        self.assertEqual(got, want)
