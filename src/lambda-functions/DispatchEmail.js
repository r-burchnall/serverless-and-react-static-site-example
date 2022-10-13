const AWS = require('aws-sdk'); // Note: provided by the lambda runtime within AWS
const SESClient = new AWS.SES({apiVersion: '2010-12-01'});


exports.main = async function (event, context) {
    try {
        const method = event.httpMethod;

        if (method === "POST") {
            if (event.path === "/") {
                const {email, name, feedback} = JSON.parse(event.body);
                if (!validateString(email) || !validateString(name) || !validateString(feedback)) {
                    return buildHTTPResponse(
                        400,
                        'Invalid body, expected valid strings for "email", "name", "feedback"', email, name, feedback, undefined)

                }

                const result = await sendEmail('feedback received', JSON.stringify({
                    email, name, feedback
                }), process.env.EMAIL_ADDRESS)

                return buildHTTPResponse(200, 'successfully sent email', email, name, feedback, result);
            }
        }

        return buildHTTPResponse(
            400,
            "We only accept POST /", undefined, undefined, undefined, undefined)
    } catch (error) {
        // TODO: Improve error handling with something like sentry
        const body = error.stack || JSON.stringify(error, null, 2);
        return buildHTTPResponse(
            500,
            JSON.stringify(body), undefined, undefined, undefined, undefined)
    }
}

async function sendEmail(subject, message, recipient) {
    console.log('sending email to', {recipient, subject})
    const command = {
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: message,
                },
            },
        },
        Destination: {
            ToAddresses: [recipient.trim()],
        },
        Source: process.env.EMAIL_ADDRESS,
    }
    try {
        return SESClient
            .sendEmail(command)
            .promise()
    } catch (e) {
        console.error(e)
        throw(e)
    }
}

function validateString(value) {
    if (!value) {
        return false
    }

    return value !== "";
}

function buildHTTPResponse(responseCode, message, email, name, feedback, result) {
    return {
        statusCode: responseCode,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            error: responseCode === 200,
            message: message,
            payload: {
                email,
                name,
                feedback,
                result
            }
        })
    };
}