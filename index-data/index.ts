import {DataMapper, ScanIterator} from "@aws/dynamodb-data-mapper";
import {attribute, hashKey, table} from "@aws/dynamodb-data-mapper-annotations";
import {ConditionExpression} from "@aws/dynamodb-expressions";
import {indexDocument} from "../service/OpenSearchClient";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import {YourDocumentType} from "../service/OpenSearchService";

// of course move this dynamo mapper into a more appropriate place, and the table too
export const dynamoDb = new DynamoDB({region: "your-region"});
export const dynamoMapper = new DataMapper({client: dynamoDb});

@table("index-me")
export class YourDocumentTableObject {
    @hashKey()
    partitionKey!: string;

    @hashKey()
    sortKey!: string;

    @attribute()
    someValue!: string;
}

export interface IndexDataEvent {
    startDate?: string
    endDate?: string
}

const dateBeforeAnyPolicies = new Date(2021, 0, 1).toISOString();

export const handler = async (event: IndexDataEvent): Promise<void> => {
    console.log("Received event to index values");

    try {
        for await (const row of scanTableFor(event)) {
            try {
                const documentId = `${row.partitionKey}_${row.sortKey}`;
                await indexDocument(documentId, row as YourDocumentType);
            } catch (error) {
                console.error("Error occurred trying to index row with pk", row.partitionKey, error);
            }
        }
    } catch (error) {
        console.error("Error occurred trying to index data", error);
        throw error;
    }
};

function scanTableFor(event: IndexDataEvent): ScanIterator<YourDocumentTableObject> {
    if (!event.startDate && !event.endDate) {
        console.log("Start date and end date not set so fetching all data from the table");
        return dynamoMapper.scan(YourDocumentTableObject);
    }
    console.log(`Setting up filter between start date: ${getStartDate(event.startDate)} and end date: ${getEndDate(event.endDate)}`);
    return dynamoMapper.scan(YourDocumentTableObject, {filter: getFilterFor(event)});
}

const getFilterFor = (event: IndexDataEvent): ConditionExpression => ({
    type: "Between",
    subject: "updatedOn",
    lowerBound: getStartDate(event.startDate),
    upperBound: getEndDate(event.endDate),
});

const getStartDate = (startDate?: string): string => startDate ?? dateBeforeAnyPolicies;

const getEndDate = (endDate?: string): string => endDate ?? new Date().toISOString();
