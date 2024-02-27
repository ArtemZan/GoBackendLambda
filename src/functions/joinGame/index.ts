import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { TABLE_NAME, db } from "utils/db";
import { unmarshall } from "@aws-sdk/util-dynamodb"
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";
import { getUserByEmail, getUserById, getUserConnections as getUserWSConnections } from "utils/db/requests";
import { Game, TEAM, User } from "../../types";
import { createWSManager } from "utils/ws";
import jwt from "jsonwebtoken";
import { getGame } from "utils/db/requests/game";
import { getTokenFromHeaders } from "utils/auth";

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production/@connections")

export async function handler(event: APIGatewayEvent) {
    const body = JSON.parse(event.body)
    const code = body?.code

    const game = await getGame(code)

    if (!game) {
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE)
    }

    const parsedJWT = getTokenFromHeaders(event.headers)
    const user = await getUserByEmail(parsedJWT.email)

    const playerTeam: TEAM = Math.random() < 0.5 ? TEAM.BLACK : TEAM.WHITE
    const opponentTeam: TEAM = playerTeam === TEAM.BLACK ? TEAM.WHITE : TEAM.BLACK

    await updateGame(game, user.id, playerTeam, opponentTeam)

    await notifyPlayers(game, user, playerTeam, opponentTeam)
}




async function notifyPlayers(game: Game, player: User, playerTeam: TEAM, opponentTeam: TEAM) {
    const playerWSConnections = await getUserWSConnections(player.id)
    const opponentWSConnections = await getUserWSConnections(game.players[0].id)

    const opponent = await getUserById(game.players[0].id)

    wsManager.sendToAll(playerWSConnections, JSON.stringify({
        action: "game/start",
        payload: {
            team: playerTeam,
            opponent
        }
    }))

    wsManager.sendToAll(opponentWSConnections, JSON.stringify({
        action: "game/start",
        payload: {
            team: opponentTeam,
            opponent: player
        }
    }))
}

async function updateGame(game: Game, newPlayerId: string, playerTeam: TEAM, opponentTeam: TEAM) {
    try {
        const player = {
            ...game.players[0],
            team: playerTeam
        }

        const opponent = {
            id: newPlayerId,
            team: opponentTeam
        }

        await db.send(new UpdateCommand({
            TableName: TABLE_NAME.GAMES,
            Key: {
                id: game.id
            },
            AttributeUpdates: {
                players: {
                    Value: JSON.stringify([
                        player,
                        opponent
                    ])
                }
            }
        }))
    }
    catch (e) {

    }
}