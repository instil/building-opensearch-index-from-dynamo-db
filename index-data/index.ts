import {ScanIterator} from "@aws/dynamodb-data-mapper";
import {ConditionExpression} from "@aws/dynamodb-expressions";
import {indexDocument} from "../service/OpenSearchClient";
import {User} from "../database/user/User";
import {dynamoMapper} from "../database/DynamoMapper";

export interface IndexDataEvent {
    startDate?: string
    endDate?: string
}

const aTimeLongAgo = new Date(1900, 0, 1).toISOString();

export const handler = async (event: IndexDataEvent): Promise<void> => {
    console.log("Received event to index existing user");

    try {
        for await (const user of scanTableFor(event)) {
            try {
                const documentId = `${user.partitionKey}_${user.sortKey}`; // This creates a unique id for the document because pk and sk together make a unique value
                await indexDocument(documentId, user as User);
            } catch (error) {
                console.error("Error occurred trying to index user with pk", user.partitionKey, error);
            }
        }
    } catch (error) {
        console.error("Error occurred trying to index data", error);
        throw error;
    }
};

function scanTableFor(event: IndexDataEvent): ScanIterator<User> {
    if (!event.startDate && !event.endDate) {
        console.log("Start date and end date not set so fetching all users from the table");
        return dynamoMapper.scan(User);
    }
    console.log(`Setting up filter between start date: ${getStartDate(event.startDate)} and end date: ${getEndDate(event.endDate)}`);
    return dynamoMapper.scan(User, {filter: getFilterFor(event)});
}

const getFilterFor = (event: IndexDataEvent): ConditionExpression => ({
    type: "Between",
    subject: "updatedOn", // this field could be different for you depending on how you structure your data in dynamo
    lowerBound: getStartDate(event.startDate),
    upperBound: getEndDate(event.endDate),
});

const getStartDate = (startDate?: string): string => startDate ?? aTimeLongAgo;

const getEndDate = (endDate?: string): string => endDate ?? new Date().toISOString();
