import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { TABLE_NAME, db } from "utils/db";
import {unmarshall} from "@aws-sdk/util-dynamodb"
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";
import { getUserConnections as getUserWSConnections } from "utils/db/requests";
import { Game } from "../../types";
import { createWSManager } from "utils/ws";

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production/@connections")

export async function handler(event: APIGatewayEvent) {
    const body = JSON.parse(event.body)
    const code = body?.code

    const game = await getGame(code)

    if(!game){
        return getResponseFromErrorCode(400, ERROR_CODE.WRONG_CODE)
    }

    const firstPlayerWSConnections = await getUserWSConnections(game.players[0])

    wsManager.sendToAll(firstPlayerWSConnections, JSON.stringify({
        action: "game/start",
        payload: {
            //?
        }
    }))
}


async function getGame(id: string): Promise<Game>{
    try{
        const resp = await db.send(new GetCommand({
            TableName: TABLE_NAME.GAMES,
            Key: {
                id
            }
        }))

        return unmarshall(resp.Item) as Game
    }
    catch(e){
        console.log(e)
    }
}
