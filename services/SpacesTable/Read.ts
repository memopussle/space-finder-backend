import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

const PRIMARY_KEY = process.env.PRIMARY_KEY;
const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello from DYnamoDb",
  };
  try {
    // if string parameters exists in document

    if (event.queryStringParameters) {
      if (PRIMARY_KEY! in event.queryStringParameters) {
      result.body = await queryWithPrimaryPartition(event.queryStringParameters);
      }
      else {
         result.body = await queryWithSecondaryPartition(
           event.queryStringParameters
         );
      }
    } else {
      result.body = await scanTable();
    }
  } catch (error) {
    if (error instanceof Error) result.body = error.message;
  }

  return result;
}

async function queryWithSecondaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const queryKey = Object.keys(queryParams)[0] // get query keys
  const queryValue = queryParams[queryKey]
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      IndexName: queryKey,
      KeyConditionExpression: "#zz = :zzzz", 
      ExpressionAttributeNames: {
        "#zz": queryKey, 
      },
      ExpressionAttributeValues: {
        ":zzzz": queryValue,
      },
    })
    .promise();
  
  return JSON.stringify(queryResponse.Items);
}

async function queryWithPrimaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const keyValue = queryParams[PRIMARY_KEY!];
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      KeyConditionExpression: "#zz = :zzzz", // define querystring.ex:spaceId=12345
      ExpressionAttributeNames: {
        "#zz": PRIMARY_KEY!, //define #zz is primary key
      },
      ExpressionAttributeValues: {
        ":zzzz": keyValue,
      },
    })
    .promise(); // promise to return this query

  return JSON.stringify(queryResponse);
}

async function scanTable() {
  const queryResponse = await dbClient
    .scan({
      TableName: TABLE_NAME!,
    })
    .promise();
  return JSON.stringify(queryResponse.Items);
}
export { handler };
