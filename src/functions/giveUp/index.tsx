import { APIGatewayEvent } from "aws-lambda";
import { getGame } from "utils/db/requests/game";
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";
import { createWSManager } from "utils/ws";

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production")


export async function handler(event: APIGatewayEvent) {
    const connectionId = event.requestContext.connectionId
    const body = JSON.parse(event.body)
    const gameId = body.gameId
    if(!gameId)
    {
        return getResponseFromErrorCode(400, ERROR_CODE.MISSING_GAME_CODE)
    }

    const game = await getGame(gameId)

    const opponent = game.players.find(player => player.connectionId !== connectionId)

    await wsManager.send(opponent.connectionId, JSON.stringify({
        action: "game/giveUp"
    }))
}