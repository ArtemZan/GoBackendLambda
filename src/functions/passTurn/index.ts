import { APIGatewayEvent } from "aws-lambda";
import { getTokenFromHeaders } from "utils/auth";
import { getGame, getPlayersConnections } from "utils/db/requests/game";
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";
import { Game, TEAM } from "../../types";
import { TABLE_NAME, db } from "utils/db";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createWSManager } from "utils/ws";

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production")

export async function handler(event: APIGatewayEvent){
    const body = JSON.parse(event.body)

    const JWT = getTokenFromHeaders(event.headers)

    const game = await getGame(body.gameId)

    if (!game) {
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE)
    }

    await updateGame(game)

    await notifyPlayers(game)
}

async function updateGame(game: Game){
    try {
        await db.send(new UpdateCommand({
            TableName: TABLE_NAME.GAMES,
            Key: {
                id: game.id
            },
            AttributeUpdates: {
                teamOnMove: {
                    Value: game.teamOnMove === TEAM.BLACK ? TEAM.WHITE : TEAM.BLACK
                }
            }
        }))
    }
    catch(e){
        console.log(e)
    }
}

async function notifyPlayers(game: Game){
    const connections = await getPlayersConnections(game)

    wsManager.sendToAll(connections.flat(), JSON.stringify({
        action: "game/passTurn"
    }))
}