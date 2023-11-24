import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import sha256 from "sha256";
import { createTokenFromUser } from "utils/auth";
import { TABLE_NAME, db } from "utils/db";
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";


export async function handler(event: APIGatewayEvent){
    const body = JSON.parse(event.body)

    const user = await findUser(body.username, body.password)
    if(!user){
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CREDENTIALS)
    }

    return {
        status: 200,
        body: createTokenFromUser(user)
    }
}


async function findUser(username: string, password: string){
    const encodedPassword = sha256(password).toString()

    try {
        const resp = await db.send(new ScanCommand({
            TableName: TABLE_NAME.USERS,
            FilterExpression: "(email = :username OR name = :username) AND password = :password",
            ExpressionAttributeValues: {
                ":username": {
                    S: username
                },
                ":password": {
                    S: encodedPassword
                }
            }
        }))

        return resp.Items[0]
    }
    catch(e){
        console.log(e)
    }
}