import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

export const db = DynamoDBDocumentClient.from(client);

export const enum TABLE_NAME {
    EMAIL_CODES = "emailCodes",
    USERS = "users"
}