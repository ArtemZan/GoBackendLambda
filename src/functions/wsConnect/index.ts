import jwt from "jsonwebtoken"
import { APIGatewayEvent } from "aws-lambda"
import { TABLE_NAME, db } from "utils/db"
import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { getUserByEmail } from "utils/db/requests"
import { getTokenFromHeaders } from "utils/auth"

export async function handler(event: APIGatewayEvent) {
    const {
        requestContext: {
            connectionId
        }
    } = event

    let parsedJWT: jwt.JwtPayload

    try {
        parsedJWT = getTokenFromHeaders(event.headers)
    }
    catch (e) {
        console.log(e)
    }
    finally {
        if (!parsedJWT) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    error: "Invalid JWT"
                })
            }
        }
    }

    const user = await getUserByEmail(parsedJWT.email)

    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                error: "Given JWT doesn't correspond to any user"
            })
        }
    }

    await saveConnection(user.id, connectionId)
}



async function saveConnection(userId: string, connectionId: string) {
    try {
        db.send(new PutCommand({
            TableName: TABLE_NAME.WS_CONNECTIONS,
            Item: {
                id: connectionId,
                userId
            }
        }))
    }
    catch (e) {
        console.log(e)
    }
}