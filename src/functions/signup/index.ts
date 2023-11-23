import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { DynamoDBClient, Select } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    GetCommand,
    DeleteCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { SignUpBody } from '../../types';
import nodemailer from "nodemailer"
import crypto from "crypto"
import sha256 from "sha256"

// Temporary solution
process.env = process.env || {}
process.env.SENDER_EMAIL = "arttema9@gmail.com"
process.env.SENDER_EMAIL_PWD = "afnatxnjfnigqatu"
process.env.VERIFY_EMAIL_URL = "http://localhost:3000/verify-email"

const client = new DynamoDBClient({});

const db = DynamoDBDocumentClient.from(client);

const enum ERROR_CODE {
    EMAIL_TAKEN = "EMAIL_TAKEN",
    SEND_EMAIL_FAILED = "SEND_EMAIL_FAILED"
}

const errorMessage: { [key in ERROR_CODE]: string } = {
    EMAIL_TAKEN: "This email is already taken",
    SEND_EMAIL_FAILED: "Failed to send email"
}

function getBodyFromErrorCode(code: ERROR_CODE) {
    return JSON.stringify({
        error: errorMessage[code],
        errorCode: code
    })
}

function getResponseFromErrorCode(code: ERROR_CODE) {
    return {
        statusCode: 400,
        body: getBodyFromErrorCode(code)
    }
}

export async function handler(event: APIGatewayEvent) {
    const body = JSON.parse(event.body) as SignUpBody

    const isEmailUsed = await checkIsEmailUsed(body.email)

    if (isEmailUsed) {
        return getResponseFromErrorCode(ERROR_CODE.EMAIL_TAKEN)
    }

    try {
        await sendValidationEmail(body.email)
    }
    catch (e) {
        console.log(e)
        return getResponseFromErrorCode(ERROR_CODE.SEND_EMAIL_FAILED)
    }

    addUser(body)
}

async function checkIsEmailUsed(email: string) {
    const response = await db.send(new ScanCommand({
        TableName: "users",
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    }))

    const users = response.Items

    return !!users?.length
}

async function generateCode() {
    let isCodeUsed = false
    let code = null

    do {
        code = crypto.randomBytes(8).toString("base64url")
        console.log("Generated code: ", code)

        const response = await db.send(new GetCommand({
            TableName: "emailCodes",
            Key: {
                code
            }
        }))

        isCodeUsed = !!response.Item
    }
    while (isCodeUsed);

    return code
}

async function sendValidationEmail(email: string) {
    const code = await generateCode()

    await db.send(new PutCommand({
        TableName: "emailCodes",
        Item: {
            email,
            code
        }
    }))

    console.log({
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_EMAIL_PWD
    })

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_EMAIL_PWD
        }
    })

    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "GO.com - verify your email",
        html: `
            <div style="display: flex; justify-content: center">
                <div style="max-width: 400px; width: 100%;">
                    <h1 style="text-align: center">Verify your email</h1>
                    Click the button below
                    <br>
                    <a 
                        href="${process.env.VERIFY_EMAIL_URL}?code=${code}" 
                        style="background-color: #ca8; padding: 10px; color: white; border: 1px solid #555; border-radius: 10px; display: inline-block">
                            Verify
                    </a>
                </div>
            </div
        `
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Failed to send the email: ", error)
                reject(error)
                return
            }

            console.log("Email sent successfully: ", info)
            resolve(null)
        })
    })
}


async function addUser(user: SignUpBody) {
    const encodedPassword = sha256(user.password).toString()

    const response = await db.send(new PutCommand({
        TableName: "users",
        Item: {
            name: user.name,
            email: user.email,
            password: encodedPassword,
            isEmailVerified: false
        }
    }))
}