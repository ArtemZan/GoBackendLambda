import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { TABLE_NAME, db } from "utils/db";
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";

export async function handler(event: APIGatewayEvent) {
    const {
        requestContext: {
            connectionId
        }
    } = event

    try {
        await db.send(new DeleteCommand({
            TableName: TABLE_NAME.WS_CONNECTIONS,
            Key: {
                id: connectionId
            }
        }))
    }
    catch(e)
    {
        console.log("Failed to delete ws connection: ", e)
    }

    return {
        statusCode: 200,
        body: ""
    }
}