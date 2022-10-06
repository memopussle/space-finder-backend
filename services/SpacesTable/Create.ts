import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";

const dbClient = new DynamoDB.DocumentClient(); // insert data to table

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello from DynamoDB",
  };

  const item =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);
  item.spaceId = v4();

  try {
    await dbClient
      .put({
        TableName: "SpacesTable",
        Item: item,
      })
      .promise();
  } catch (error) {
    console.log(error)
  }

  result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);
  return result;
}

export { handler };
