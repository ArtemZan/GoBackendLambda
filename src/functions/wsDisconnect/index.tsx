import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { TABLE_NAME, db } from "utils/db";

export async function handler(event: APIGatewayEvent) {
    const connectionId = event.requestContext?.connectionId 

    deleteGame(connectionId)

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

async function deleteGame(connectionId: string)
{
    try {
        const games = await db.send(new ScanCommand({
            TableName: TABLE_NAME.GAMES,
            FilterExpression: "contains(players, :searched_string)",
            ExpressionAttributeValues: {
                ":searched_string": {
                    S: `"connectionId":"${connectionId}"`
                }
            }
        }))

        console.log("Found games for deletion: ", games)
    }
    catch(e)
    {
        console.log("Failed to delete the game")
    }
}