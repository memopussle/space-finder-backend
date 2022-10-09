import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { getEventBody } from "../Shared/Utils";

const TABLE_NAME = process.env.TABLE_NAME as string; // as string fixes string | undefined suggestion -> TABLE_NAME: string
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;
const dbClient = new DynamoDB.DocumentClient();

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello from DYnamoDb",
  };

  // request body
  const requestBody = getEventBody(event);
  const spaceId = event.queryStringParameters?.[PRIMARY_KEY]; //?: only get queryStringParameters if it exists
  try {
    if (requestBody && spaceId) {
      //get the key from request body
      const requestBodyKey = Object.keys(requestBody)[0];

      //get the value
      const requestBodyValue = requestBody[requestBodyKey];

      const updateResult = await dbClient
        .update({
          TableName: TABLE_NAME,
          Key: {
            [PRIMARY_KEY]: spaceId, // ->PRIMARY_KEY: spaceID wont work. need to wrap [PRIMARY_KEY]
          },
          UpdateExpression: "set #zzzNew = :new",
          ExpressionAttributeValues: {
            ":new": requestBodyValue,
          },
          ExpressionAttributeNames: {
            "#zzzNew": requestBodyKey,
          },
          ReturnValues: "UPDATED_NEW", // tell what's updated
        })
        .promise();

      result.body = JSON.stringify(updateResult);
    }
  } catch (error) {
    if (error instanceof Error)
      result.body = JSON.stringify({ message: error.message }); // convert to JSON string
  }

  return result;
}
export { handler };
