import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {generateRandomId, getEventBody, addCorsHeader} from "../Shared/Utils"
import {
  MissingFieldError,
  validateAsSpaceEntry,
} from "../Shared/InputValidator";

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
 addCorsHeader(result)
  try {
    const item = getEventBody(event);
    item.spaceId = generateRandomId(); // generate random Id

    //validate the item value
    validateAsSpaceEntry(item);
    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: item,
      })
      .promise();
    result.body = JSON.stringify({
      id: item.spaceId
    });
  } catch (error) {
    if (error instanceof MissingFieldError) {
      result.statusCode = 403;
    } else {
      result.statusCode = 500;
    }
    // need to have if block -> prevent error breaks
    if (error instanceof Error)
      result.body = JSON.stringify({ message: error.message });
  }

  return result;
}
export { handler };
