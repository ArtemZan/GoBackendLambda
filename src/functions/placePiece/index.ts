import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
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
    const body = JSON.parse(event.body)

    const JWT = getTokenFromHeaders(event.headers)

    const game = await getGame(body.gameId)

    if (!game) {
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE)
    }

    const { isSuicide, updatedGame } = placePiece(game, JWT.id, body.position)

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
}

function placePiece(game: Game, userId: string, position: Point) {

    const index = pointToIndex(position)

    const team = game.players.find(p => p.id === userId)?.team

    const {
        isSuicide,
        removedPieces
    } = findRemovedPieces(game, position, team)

    if (isSuicide) {
        return {
            isSuicide: true
        }
    }

    const updatedGame: Game = {
        ...game,
        players: game.players.map(player => {
            const updatedPieces = removedPieces?.length ? player.pieces.filter(index => !removedPieces[index]) : player.pieces

            if (player.id === userId) {
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
                    Value: updatedGame.players
                }
            }
        }))
    }
    catch (e) {
        console.log(e)
    }
}

async function notifyPlayers(updatedGame: Game) {

    try {
        const connections = await Promise.all(updatedGame.players.map(player => getUserConnections(player.id)))

        wsManager.sendToAll(connections.flat(), JSON.stringify({
            action: "game/passTurn",
            body: updatedGame
        }))
    }
    catch (e) {
        console.log(e)
        return
    }

}
