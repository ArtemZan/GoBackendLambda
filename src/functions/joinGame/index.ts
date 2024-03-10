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
    const body = JSON.parse(event.body)
    const code = body?.code

    const connectionId = event.requestContext?.connectionId

    const game = await getGame(code)

    if (!game) {
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE)
    }

    const parsedJWT = getTokenFromHeaders(event.headers)
    const user = await getUserByEmail(parsedJWT.email)

    const playerTeam: TEAM = Math.random() < 0.5 ? TEAM.BLACK : TEAM.WHITE
    const opponentTeam: TEAM = playerTeam === TEAM.BLACK ? TEAM.WHITE : TEAM.BLACK

    await updateGame(game, connectionId, playerTeam, opponentTeam)

    await notifyPlayers(game, user, connectionId, playerTeam, opponentTeam)
}


async function getConnnection(connectionId)
{
    try{
        return await db.send(new GetCommand({
            TableName: TABLE_NAME.WS_CONNECTIONS,
            Key: {
                connectionId
            }
        }))
    }
    catch(e)
    {
        console.log("Failed to get connection: ", e)
    }
}

async function notifyPlayers(game: Game, player: User, playerConnectionId: string, playerTeam: TEAM, opponentTeam: TEAM) {

    console.log("Notify players: ", game, playerConnectionId, playerTeam, opponentTeam)
    const opponentConnection = await getConnnection(game.players[0].connectionId) as unknown as Connection
    const opponent = await getUserById(opponentConnection.userId);

    await wsManager.send(playerConnectionId, JSON.stringify({
        action: "game.start",
        payload: {
            team: playerTeam,
            opponent
        }
    }))

    await wsManager.send(game.players[0].connectionId, JSON.stringify({
        action: "game.start",
        payload: {
            team: opponentTeam,
            opponent: player
        }
    }))

    console.log("Sent all connections")
}

async function updateGame(game: Game, connectionId: string, playerTeam: TEAM, opponentTeam: TEAM) {
    try {
        const player = {
            ...game.players[0],
            team: playerTeam
        }

        const opponent = {
            id: connectionId,
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