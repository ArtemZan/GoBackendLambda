import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { getTokenFromHeaders } from "utils/auth";
import { TABLE_NAME, db } from "utils/db";
import { getUserByEmail } from "utils/db/requests";
import { ERROR_CODE, getResponseFromErrorCode } from "utils/errors";
import { v4 as UUID } from "uuid"
import { TEAM } from "../../types";

export async function handler(event: APIGatewayEvent){
    const jwt = getTokenFromHeaders(event.headers)

    const user = await getUserByEmail(jwt.email)

    if(!user){
        console.log("Invalid email")
        return
    }

    const gameId = createGame(user.id)

    if(!gameId){
        return getResponseFromErrorCode(500, ERROR_CODE.UNKNOWN_ERROR)
    }

    return {
        status: 200,
        body: JSON.stringify({
            code: gameId
        })
    }
}


async function createGame(userId: string){
    const gameId = UUID()

    try{
        await db.send(new PutCommand({
            TableName: TABLE_NAME.GAMES,
            Item: {
                id: gameId,
                players: [
                    {
                        id: userId
                    }
                ],
                // Black always begin
                teamOnMove: TEAM.BLACK
            }
        }))

        return gameId
    }
    catch(e){
        console.log(e)
    }
}