import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";

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

  const spaceId = event.queryStringParameters?.[PRIMARY_KEY]; //?: only get queryStringParameters if it exists

  if (spaceId) {
    const deleteResult = await dbClient
      .delete({
        TableName: TABLE_NAME,
        Key: {
          [PRIMARY_KEY]: spaceId,
        },
      })
      .promise();

    result.body = JSON.stringify(deleteResult);
  }

  return result;
}
export { handler };
