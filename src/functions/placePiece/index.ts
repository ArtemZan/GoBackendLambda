import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { getTokenFromHeaders } from "utils/auth";
import { TABLE_NAME, db } from "utils/db";
import { getUserByEmail } from "utils/db/requests";
import { getGame } from "utils/db/requests/game";
import { Game, TEAM } from "../../types";

export async function handler(event: APIGatewayEvent){
    const body = JSON.parse(event.body)

    const JWT = getTokenFromHeaders(event.headers)
    const user = await getUserByEmail(JWT.email)

    if(!user){
        return {
            statusCode: 401,
            body: JSON.stringify({
                error: "User not found"
            })
        }
    }

    const game = await getGame(body.gameId)

    if(!game){
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "This game doesn't exist"
            })
        }
    }

    // To do: calculate the killed pieces

    // To do: get the actual board size
    const boardWidth = 9

    const position = body.position
    const index = position.y * boardWidth + position.x

    // To do: ...
    //await updateGame(game, user.)
}

async function updateGame(game: Game, team: TEAM, position: number){
    try{
        const pieces = {...game.pieces}
        if(team === TEAM.WHITE){
            pieces.white = [...pieces.white, position]
        }
        else {
            pieces.black = [...pieces.black, position]
        }

        const resp = await db.send(new UpdateCommand({
            TableName: TABLE_NAME.GAMES,
            Key: {
                id: game.id
            },
            AttributeUpdates: {
                pieces: {
                    Value: pieces
                }
            }
        }))
    }
    catch(e){
        console.log(e)
    }
}