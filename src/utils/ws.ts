import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";

export function createWSManager(endpoint: string) {
    const apigwManagementApi = new ApiGatewayManagementApi({
        endpoint
    });


    function send(connectionId: string, data: string) {
        console.log("Send ws message to: ", connectionId, "data: ", data)
        apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: `Echo: ${data}` }, (err, data) => {
            if(err)
            {
                console.log("Failed to send message to: ", connectionId, ". Reason: ", err)
                return
            }

            console.log("Sent message to: ", connectionId, ". Result data: ", data)
        });
    }

    function sendToAll(connectionIds: string[], data: string) {
        connectionIds.forEach(id => send(id, data))
    }

    return {
        send,
        sendToAll
    }
}
