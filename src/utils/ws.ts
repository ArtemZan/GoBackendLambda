import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";

export function createWSManager(endpoint: string) {
    const apigwManagementApi = new ApiGatewayManagementApi({
        endpoint
    });


    function send(connectionId: string, data: string) {
        console.log("Send ws message to: ", connectionId, "data: ", data)
        apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: `Echo: ${data}` });
    }

    function sendToAll(connectionIds: string[], data: string) {
        connectionIds.forEach(id => send(id, data))
    }

    return {
        send,
        sendToAll
    }
}
