import jwt from "jsonwebtoken"
import {ApiGatewayManagementApi} from "@aws-sdk/client-apigatewaymanagementapi"
import { createWSManager } from "utils/ws"
import { APIGatewayEvent } from "aws-lambda"
import { TABLE_NAME, db } from "utils/db"
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"
import { User } from "../../types"
import { unmarshall } from "@aws-sdk/util-dynamodb"
import { getUserByEmail } from "utils/db/requests"

const wsManager = createWSManager("https://ckgwnq8zq9.execute-api.eu-north-1.amazonaws.com/production/@connections")

export async function handler(event: APIGatewayEvent) {
    const {
        requestContext: {
            connectionId
        }
    } = event

    let parsedJWT: jwt.JwtPayload

    try{
        const body = JSON.parse(event.body)
        
        parsedJWT = jwt.decode(body.token) as jwt.JwtPayload
    }
    catch(e){
        console.log(e)
    }
    finally{
        if(!parsedJWT){
            wsManager.send(connectionId, JSON.stringify({
                error: "Invalid JWT provided in body"
            }))
            return
        }
    }

    const user = await getUserByEmail(parsedJWT.email)

    if(!user){
        wsManager.send(connectionId, JSON.stringify({
            error: "Given JWT doesn't correspond to any user"
        }))
        return
    }

    await saveConnection(user.id, connectionId)
}



async function saveConnection(userId: string, connectionId: string){
    try{
        db.send(new PutCommand({
            TableName: TABLE_NAME.WS_CONNECTIONS,
            Item: {
                id: connectionId,
                userId
            }
        }))
    }
    catch(e){
        console.log(e)
    }
}