import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
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
        const keyValue = event.queryStringParameters[PRIMARY_KEY!];
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

        result.body = JSON.stringify(queryResponse);
      }
    } else {
      const queryResponse = await dbClient
        .scan({
          TableName: TABLE_NAME!,
        })
        .promise();
      result.body = JSON.stringify(queryResponse);
    }
  } catch (error) {
    if (error instanceof Error) result.body = error.message;
  }

  return result;
}
export { handler };
