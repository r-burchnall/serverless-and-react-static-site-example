const AWS = require('aws-sdk'); // Note: provided by the lambda runtime within AWS
const SESClient = new AWS.SES();

exports.main = async function (event, context) {
    try {
        const method = event.httpMethod;

        if (method === "POST") {
            if (event.path === "/") {
                const {email, name, feedback} = event.input.body;
                if (!validateString(email) || !validateString(name) || !validateString(feedback)) {
                    return {
                        statusCode: 400,
                        headers: {},
                        body: JSON.stringify({
                            error: true,
                            message: 'Invalid body, expected valid strings for "email", "name", "feedback"',
                            payload: {
                                email,
                                name,
                                feedback
                            }
                        })
                    };
                }

                const result = await sendEmail('feedback received', JSON.stringify({
                    email, name, feedback
                }), process.env.EMAIL_ADDRESS)

                return {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify({
                        error: false,
                        message: 'successfully sent email',
                        payload: {
                            email,
                            name,
                            feedback
                        }
                    })
                };
            }
        }

        return {
            statusCode: 400,
            headers: {},
            body: "We only accept POST /feedback"
        };
    } catch (error) {
        // TODO: Improve error handling with something like sentry
        const body = error.stack || JSON.stringify(error, null, 2);
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify(body)
        }
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
    return SESClient
        .send(command)
}

function validateString(value) {
    if (!value) {
        return false
    }

    return value !== "";
}