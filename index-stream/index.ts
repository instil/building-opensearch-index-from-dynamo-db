import {DynamoDBStreamEvent} from "aws-lambda";
import {DynamoDB} from "aws-sdk";
import {indexDocumentInOpenSearch, removeDocumentFromOpenSearch} from "../service/OpenSearchService";
import {User} from "../database/user/User";

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
    console.log("Received event from some table");

    for (const record of event.Records) {
        if (!record.eventName || !record.dynamodb || !record.dynamodb.Keys) continue;

        const partitionKey = record.dynamodb.Keys.partitionKey.S;
        const sortKey = record.dynamodb.Keys.sortKey.S;
        // Note here that we are using a pk and sk but maybe you are using only an id, this would look like:
        // const id = record.dynamodb.Keys.id.S;

        try {
            if (record.eventName === "REMOVE") {
                console.log("Received remove event from some table, deleting the document from OpenSearch");
                return await removeDocumentFromOpenSearch(partitionKey, sortKey);
            } else {
                if (!record.dynamodb.NewImage) continue;

                console.log(`Received ${record.eventName.toLowerCase()} event from dynamo, indexing the document in OpenSearch`);
                const document = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as User;
                return await indexDocumentInOpenSearch(document, partitionKey, sortKey);
            }
        } catch (error) {
            console.error("Error occurred updating OpenSearch domain", error);
            throw error;
        }
    }
};
