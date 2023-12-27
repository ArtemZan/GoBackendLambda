import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { getTokenFromHeaders } from "utils/auth";
import { TABLE_NAME, db } from "utils/db";
import { getUserByEmail, getUserConnections } from "utils/db/requests";
import { getGame } from "utils/db/requests/game";
import { Game, TEAM } from "../../types";
import { createWSManager } from "utils/ws";

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production/@connections")

export async function handler(event: APIGatewayEvent) {
    const body = JSON.parse(event.body)

    const JWT = getTokenFromHeaders(event.headers)

    const game = await getGame(body.gameId)

    if (!game) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "This game doesn't exist"
            })
        }
    }

    const updatedGame = placePiece(game, JWT.id, body.position)

    await updateGame(updatedGame)

    await notifyPlayers(updatedGame)
}

function placePiece(game: Game, userId: string, position: { x: number, y: number }) {
    
    // To do: get the actual board size.
    const boardWidth = 9
    const index = position.y * boardWidth + position.x
    
    // To do: calculate the killed pieces
    const updatedGame: Game = {
        ...game,
        players: game.players.map(player => player.id === userId ?
            {
                ...player,
                pieces: [
                    ...player.pieces,
                    index
                ]
            }
            :
            player)
    }

    return updatedGame
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
            action: "updatePieces",
            body: updatedGame
        }))
    }
    catch(e){
        console.log(e)
        return
    }

}