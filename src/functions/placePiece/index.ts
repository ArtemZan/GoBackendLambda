import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent, APIGatewayEventRequestContext, Context, Handler } from "aws-lambda";
import { getTokenFromHeaders } from "utils/auth";
import { TABLE_NAME, db } from "utils/db";
import { getUserByEmail, getUserConnections } from "utils/db/requests";
import { getGame } from "utils/db/requests/game";
import { Game, Point, TEAM } from "../../types";
import { createWSManager } from "utils/ws";
import { findRemovedPieces, pointToIndex } from "./findRemovedPieces";
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production")

export async function handler(event: APIGatewayEvent) {
    const body = JSON.parse(event.body)?.body
    const connectionId = event.requestContext?.connectionId

    console.log("Getting game by code: ", body.gameId)
    const game = await getGame(body.gameId)
    console.log("Got game: ", game)

    if (!game) {
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE)
    }

    const { isSuicide, updatedGame } = placePiece(game, connectionId, body.position)
    console.log("Placed a piece. Is a suicide: ", isSuicide, "updated game: ", updatedGame)

    if (isSuicide) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "This is suicide"
            })
        }
    }

    await updateGame(updatedGame)

    await notifyPlayers(updatedGame)

    return {
        statusCode: 200
    }
}

function placePiece(game: Game, connectionId: string, position: Point) {

    const index = pointToIndex(position)

    const team = game.players.find(p => p.connectionId === connectionId)?.team

    const {
        isSuicide,
        removedPieces
    } = findRemovedPieces(game, position, team)

    console.log("Found removed pieces. Is suicide: ", isSuicide, "removedPieces: ", removedPieces)

    if (isSuicide) {
        return {
            isSuicide: true
        }
    }

    const updatedGame: Game = {
        ...game,
        players: game.players.map(player => {
            const updatedPieces = (removedPieces?.length ? player.pieces.filter(index => !removedPieces[index]) : player.pieces) || []

            if (player.connectionId === connectionId) {
                updatedPieces.push(index)
            }

            return {
                ...player,
                pieces: updatedPieces
            }
        })
    }

    return {
        updatedGame
    }
}


async function updateGame(updatedGame: Game) {
    try {
        const resp = await db.send(new UpdateCommand({
            TableName: TABLE_NAME.GAMES,
            Key: {
                id: updatedGame.id
            },
            AttributeUpdates: {
                players: {
                    Value: JSON.stringify(updatedGame.players)
                }
            }
        }))
    }
    catch (e) {
        console.log(e)
    }
}

async function notifyPlayers(updatedGame: Game) {
    console.log("")

    try {
        const connections = updatedGame.players.map(player => player.connectionId)

        await wsManager.sendToAll(connections, JSON.stringify({
            action: "game.placePiece",
            body: updatedGame
        }))
    }
    catch (e) {
        console.log(e)
        return
    }

}
