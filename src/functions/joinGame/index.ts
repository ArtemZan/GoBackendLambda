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

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production/@connections")

export async function handler(event: APIGatewayEvent) {
    const body = JSON.parse(event.body)
    const code = body?.code

    const game = await getGame(code)

    if (!game) {
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE)
    }

    const parsedJWT = jwt.decode(body.token) as jwt.JwtPayload
    const user = await getUserByEmail(parsedJWT.email)

    await updateGame(game, user.id)

    await notifyPlayers(game, user)
}




async function notifyPlayers(game: Game, player: User) {
    const playerTeam: TEAM = Math.random() < 0.5 ? TEAM.BLACK : TEAM.WHITE
    const opponentTeam: TEAM = playerTeam === TEAM.BLACK ? TEAM.WHITE : TEAM.BLACK


    const playerWSConnections = await getUserWSConnections(player.id)
    const opponentWSConnections = await getUserWSConnections(game.players[0])

    const opponent = await getUserById(game.players[0])

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

async function updateGame(game: Game, newPlayerId: string) {
    try {
        await db.send(new UpdateCommand({
            TableName: TABLE_NAME.GAMES,
            Key: {
                id: game.id
            },
            AttributeUpdates: {
                players: {
                    Value: [
                        game.players[0],
                        newPlayerId
                    ]
                }
            }
        }))
    }
    catch (e) {

    }
}