import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export async function handler(event: APIGatewayEvent){
    return JSON.stringify({
        data: "lalala1"
    })
}