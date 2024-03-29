import jwt from "jsonwebtoken"
import { APIGatewayEvent, Context } from "aws-lambda"
import { TABLE_NAME, db } from "utils/db"
import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { getUserByEmail } from "utils/db/requests"
import { getTokenFromHeaders } from "utils/auth"

export async function handler(event: APIGatewayEvent, context: Context) {
    const {
        requestContext: {
            connectionId
        }
    } = event

    let parsedJWT: jwt.JwtPayload

    const queryParams = event.queryStringParameters
    console.log(queryParams)

    try {
        parsedJWT = jwt.decode(queryParams.JWT) as jwt.JwtPayload
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

    console.log("Got token: ", parsedJWT)

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

    return {
        statusCode: 200,
        body: ""
    }
}



async function saveConnection(userId: string, connectionId: string) {
    console.log("Saving connection: ", userId, connectionId)
    try {
        return db.send(new PutCommand({
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