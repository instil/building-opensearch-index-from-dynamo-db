import DynamoDB = require("aws-sdk/clients/dynamodb");
import {DataMapper} from "@aws/dynamodb-data-mapper";

export const dynamoDb = new DynamoDB({region: "your-region"});
export const dynamoMapper = new DataMapper({client: dynamoDb});
