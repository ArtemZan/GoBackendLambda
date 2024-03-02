import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { getTokenFromHeaders } from "utils/auth";
import { TABLE_NAME, db } from "utils/db";
import { getUserById, getUserConnections } from "utils/db/requests";
import { getGame, getPlayersConnections } from "utils/db/requests/game";
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";
import { createWSManager } from "utils/ws";
import { Connection } from "../../types";

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production")


export async function handler(event: APIGatewayEvent) {
    const connectionId = event.requestContext.connectionId
    const body = JSON.parse(event.body)
    const gameId = body.gameId
    if(!gameId)
    {
        return getResponseFromErrorCode(400, ERROR_CODE.MISSING_GAME_CODE)
    }

    const connection = await getConnection(connectionId)

    const game = await getGame(gameId)

    const opponent = game.players.find(player => player.id !== connection.userId)

    const connections = await getUserConnections(opponent.id)

    await wsManager.sendToAll(connections, JSON.stringify({
        action: "game/giveUp"
    }))
}

async function getConnection(connectionId: string) {
    try {
        const resp = await db.send(new GetCommand({
            TableName: TABLE_NAME.WS_CONNECTIONS,
            Key: {
                id: connectionId
            }
        }))

        return resp.Item as Connection
    }
    catch (e) {
        console.log("Failed to get conenction by id:", e)
    }
}