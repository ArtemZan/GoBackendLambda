import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"
import { TABLE_NAME, db } from ".."
import { User } from "../../../types"
import { unmarshall } from "@aws-sdk/util-dynamodb"

export async function getUserByEmail(email: string) {
    try {
        const resp = await db.send(new ScanCommand({
            TableName: TABLE_NAME.USERS,
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email
            }
        }))

        console.log("Got user: ", resp.Items)

        if (resp.Count > 1) {
            console.log(`Found ${resp.Count} users with the given email!`)
        }

        return unmarshall(resp.Items[0]) as User
    }
    catch (e) {
        console.log(e)
    }
}

export async function getUserById(id: string){
    try {
        const resp = await db.send(new GetCommand({
            TableName: TABLE_NAME.USERS,
            Key: {
                id
            }
        }))

        return unmarshall(resp.Item) as User
    }
    catch (e) {
        console.log(e)
    }
}


export async function getUserConnections(userId: string) {
    try {
        const resp = await db.send(new ScanCommand({
            TableName: TABLE_NAME.WS_CONNECTIONS,
            FilterExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }))

        return resp.Items?.map(item => unmarshall(item).id)
    }
    catch (e) {
        console.log(e)
    }
}