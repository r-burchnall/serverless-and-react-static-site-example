from unittest import TestCase

from aws_lambda_typing import responses, events

from lambda_handler import index


class TestLambdaHandler(TestCase):
    def test_string(self):
        a = 'some'
        b = 'some'
        self.assertEqual(a, b)

    def test_boolean(self):
        a = True
        b = True
        self.assertEqual(a, b)

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

        print('Comparing values', got['statusCode'], want['statusCode'])
        self.assertEqual(got['statusCode'], want['statusCode'])
        self.assertEqual(got['body'], want['body'])
