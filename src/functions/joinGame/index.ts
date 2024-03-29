import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { TABLE_NAME, db } from "utils/db";
import { unmarshall } from "@aws-sdk/util-dynamodb"
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";
import { getUserByEmail, getUserById, getUserConnections as getUserWSConnections } from "utils/db/requests";
import { Connection, Game, TEAM, User } from "../../types";
import { createWSManager } from "utils/ws";
import jwt from "jsonwebtoken";
import { getGame } from "utils/db/requests/game";
import { getTokenFromHeaders } from "utils/auth";

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production")

export async function handler(event: APIGatewayEvent) {
    const body = JSON.parse(event.body)?.body
    const code = body?.code

    const connectionId = event.requestContext?.connectionId

    const game = await getGame(code)

    console.log("Got game: ", game)

    if (!game) {
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE, true)
    }

    const connection = await getConnnection(connectionId)

    const user = await getUserById(connection.userId)

    console.log("Got user: ", user)

    const playerTeam: TEAM = Math.random() < 0.5 ? TEAM.BLACK : TEAM.WHITE
    const opponentTeam: TEAM = playerTeam === TEAM.BLACK ? TEAM.WHITE : TEAM.BLACK

    await updateGame(game, connectionId, playerTeam, opponentTeam)

    await notifyPlayers(game, user, connectionId, playerTeam, opponentTeam)

    return {
        statusCode: 200
    }
}


async function getConnnection(connectionId: string) {
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
        console.log("Failed to get connection: ", e)
    }
}

async function notifyPlayers(game: Game, player: User, playerConnectionId: string, playerTeam: TEAM, opponentTeam: TEAM) {

    console.log("Notify players: ", game, playerConnectionId, playerTeam, opponentTeam)
    const opponentConnection = await getConnnection(game.players[0].connectionId)
    const opponent = await getUserById(opponentConnection.userId);

    const {password: _0, isEmailVerified: _2, id: _4, email: _6, ...playerDTO} = player
    const {password: _1, isEmailVerified: _3, id: _5, email: _7, ...opponentDTO} = opponent

    await wsManager.send(playerConnectionId, JSON.stringify({
        action: "game.start",
        payload: {
            team: playerTeam,
            opponent: opponentDTO
        }
    }))

    await wsManager.send(game.players[0].connectionId, JSON.stringify({
        action: "game.start",
        payload: {
            team: opponentTeam,
            opponent: playerDTO
        }
    }))

    console.log("Sent all connections")
}

async function updateGame(game: Game, connectionId: string, playerTeam: TEAM, opponentTeam: TEAM) {
    try {
        const player = {
            connectionId,
            team: playerTeam
        }
        
        const opponent = {
            ...game.players[0],
            team: opponentTeam
        }

        console.log("Update game: ", {
            players: {
                Value: JSON.stringify([
                    player,
                    opponent
                ])
            }
        })

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
        console.log("updateGame error: ", e)
    }
}