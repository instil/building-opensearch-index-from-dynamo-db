## Lambdas for OpenSearch with a DynamoDb source

This contains lambdas to help handle OpenSearch with DynamoDb

### Indexing from a DynamoDb Stream

Inside the `index-stream` directory you'll find the code for indexing remove/insert/modify stream events from DynamoDB.
If you are unsure on how to set up a dynamo stream then check this out
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html#Streams.Enabling

Or if you are using CDK, here is an example of the table with a stream event:

```
  const indexMe = new dynamodb.Table(this, "IndexMeTable", {
    tableName: "index-me",
    billingMode: BillingMode.PAY_PER_REQUEST,
    partitionKey: {name: "partitionKey", type: AttributeType.STRING},
    sortKey: {name: "sortKey", type: AttributeType.STRING},
    pointInTimeRecovery: true,
    stream: StreamViewType.NEW_IMAGE // This is the important line!
  });
```

After this you just need to tell the stream where you want it to go:

```
  this.yourIndexingLambdaFunction.addEventSource(new DynamoEventSource(this.someTable, {
    startingPosition: StartingPosition.TRIM_HORIZON,
    batchSize: 1,
    retryAttempts: 3
  }));
```

### Deleting an index

Inside the `delete-index` folder you will find another lambda. This one can be set up to have a trigger, however I would
recommend just manually triggering it from the console when you need to.

### Indexing existing data

Inside the `index-data` folder you will find another lambda. This one can be set up to have a trigger, however I would
recommend just manually triggering it from the console when you need to. It has been set up to allows an optional date
range if you wish to only index data from a certain range (provided you have some field on your object like createdDate
or updatedOn etc)
