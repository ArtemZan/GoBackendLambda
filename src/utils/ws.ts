import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";

export function createWSManager(endpoint: string) {
    const apigwManagementApi = new ApiGatewayManagementApi({
        endpoint
    });


    async function send(connectionId: string, data: string) {
        console.log("Send ws message to: ", connectionId, "data: ", data)
        await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: data });
    }

    function sendToAll(connectionIds: string[], data: string) {
        return Promise.all(connectionIds.map(id => send(id, data)))
    }

    return {
        send,
        sendToAll
    }
}
