import { APIGatewayEvent } from 'aws-lambda';
import {
    ScanCommand,
    PutCommand
} from "@aws-sdk/lib-dynamodb";
import { SignUpBody } from '../../types';
import nodemailer from "nodemailer"
import sha256 from "sha256"
import { v4 as UUID } from "uuid"

import { getResponseFromErrorCode, ERROR_CODE } from "utils/errors"
import { db } from 'utils/db';
import { getUserByEmail } from 'utils/db/requests';

// Temporary solution
process.env = process.env || {}
process.env.SENDER_EMAIL = "arttema9@gmail.com"
process.env.SENDER_EMAIL_PWD = "afnatxnjfnigqatu"
process.env.VERIFY_EMAIL_URL = "http://localhost:3000/verify-email"



export async function handler(event: APIGatewayEvent) {
    const body = JSON.parse(event.body) as SignUpBody

    const isEmailUsed = await checkIsEmailUsed(body.email)

    if (isEmailUsed) {
        return getResponseFromErrorCode(400, ERROR_CODE.EMAIL_TAKEN)
    }

    try {
        await sendValidationEmail(body.email)
    }
    catch (e) {
        console.log(e)
        return getResponseFromErrorCode(500, ERROR_CODE.SEND_EMAIL_FAILED)
    }

    try {
        await addUser(body)
    }
    catch (e) {
        console.log(e)
        return getResponseFromErrorCode(500, ERROR_CODE.UNKNOWN_ERROR)
    }
}

async function checkIsEmailUsed(email: string) {
    return !!getUserByEmail(email)
}

async function sendValidationEmail(email: string) {
    const code = UUID()

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
                <div style="max-width: 400px; width: 100%; margin: auto">
                    <h1 style="text-align: center">Verify your email</h1>
                    Click the button below
                    <br>
                    <a 
                        href="${process.env.VERIFY_EMAIL_URL}?code=${code}" 
                        style="background-color: #ca8; padding: 10px 30px; color: white; border: 1px solid #555; border-radius: 10px; display: inline-block; text-decoration: none">
                            Verify
                    </a>
                </div>
            </div>
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
            id: UUID(),
            name: user.name,
            email: user.email,
            password: encodedPassword,
            isEmailVerified: false
        }
    }))

    console.log(response)

    return response
}