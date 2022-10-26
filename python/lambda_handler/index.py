from aws_lambda_typing import events, context, responses


def handler(event: events.api_gateway_proxy.APIGatewayProxyEventV1,
            context: context.Context) -> responses.APIGatewayProxyResponseV1:
    try:
        if event['path'] == '/' and event['httpMethod'] == 'POST':
            return _build_http_response(200, 'got request')
        else:
            return _build_http_response(
                400,
                "Bad request, was expecting a POST request to /, but got '{0}' and {1}".format(
                    event['httpMethod'],
                    event['path']
                )
            )

    except Exception as err:
        return _build_http_response(500, "{0}".format(err))


def _build_http_response(status_code: int, body: str) -> responses.APIGatewayProxyResponseV1:
    response: responses.APIGatewayProxyResponseV1 = {
        'statusCode': status_code,
        'headers': {
            "Access-Control-Allow-Origin": "*"
        },
        'multiValueHeaders': {},
        'isBase64Encoded': False,
        'body': body,
    }
    return response
