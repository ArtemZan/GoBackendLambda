import { unmarshall } from "@aws-sdk/util-dynamodb"
import { TABLE_NAME, db } from ".."
import { GetCommand } from "@aws-sdk/lib-dynamodb"
import { Game } from "../../../types"

export async function getGame(id: string): Promise<Game>{
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