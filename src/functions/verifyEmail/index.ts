import { DeleteCommand, GetCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { TABLE_NAME, db } from "utils/db";
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";
import jwt from "jsonwebtoken"
import { createTokenFromUser } from "utils/auth";

// Temporary solution
process.env = process.env || {}
process.env.JWT_SECRET_KEY = "jwt_secret_key"


export async function handler(event: APIGatewayEvent){
    const body = JSON.parse(event.body)

    let codeEntry: {email: string, code: string} = null

    try{
        const codeResp = await db.send(new GetCommand({
            TableName: TABLE_NAME.EMAIL_CODES,
            Key: {
                code: body.code
            }
        }))

        codeEntry = codeResp.Item as any
    }
    catch(e){
        console.log(e)
    }

    if(!codeEntry){
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE)
    }
    

    try {
        await db.send(new DeleteCommand({
            TableName: TABLE_NAME.EMAIL_CODES,
            Key: {
                code: body.code
            }
        }))
    }
    catch(e){
        console.log(e)
        return getResponseFromErrorCode(500, ERROR_CODE.UNKNOWN_ERROR)
    }

    let user = null

    try{
        const userResp = await db.send(new ScanCommand({
            TableName: TABLE_NAME.USERS,
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": codeEntry.email
            }
        }))

        user = userResp.Items[0]
    }
    catch(e){
        console.log(e)
        return getResponseFromErrorCode(500, ERROR_CODE.UNKNOWN_ERROR)
    }


    try {
        user.isEmailVerified = true
        await db.send(new UpdateCommand({
            TableName: TABLE_NAME.USERS,
            Key: {
                id: user.id
            },
            UpdateExpression: "set isEmailVerified = :isEmailVerified",
            ExpressionAttributeValues: {
                ":isEmailVerified": true
            }
        }))
    }
    catch(e){
        console.log(e)
        return getResponseFromErrorCode(500, ERROR_CODE.UNKNOWN_ERROR)
    }

    return {
        status: 200,
        body: createTokenFromUser(user)
    }
}