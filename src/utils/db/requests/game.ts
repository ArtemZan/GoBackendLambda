import { unmarshall } from "@aws-sdk/util-dynamodb"
import { TABLE_NAME, db } from ".."
import { GetCommand } from "@aws-sdk/lib-dynamodb"
import { Game } from "../../../types"
import { getUserConnections } from "."

export async function getGame(id: string): Promise<Game>{
    try{
        const resp = await db.send(new GetCommand({
            TableName: TABLE_NAME.GAMES,
            Key: {
                id
            }
        }))
        console.log("Got game: ", resp)

        if(!resp.Item)
        {
            return
        }

        const game = {
            ...resp.Item,
            players: JSON.parse(resp.Item.players)
        } as Game

        return game
    }
    catch(e){
        console.log(e)
    }
}

// export async function getPlayersConnections(game: Game){
//     return Promise.all(game.players.map(player => getUserConnections(player.id)))
// }