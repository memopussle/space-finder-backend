import { APIGatewayProxyEvent } from "aws-lambda";
import { APIGateway, S3 } from "aws-sdk";

const S3Client = new S3(); //new s3 client

async function handler(event: any, context: any) {

  // check if its authorized
  if (isAuthorized(event)) {
     return {
       statusCode: 200,
       body: JSON.stringify('You are authorized'),
     }
  } else {
     return {
       statusCode: 401,
       body: JSON.stringify("You are not authorized"),
     };
  }

 
}

function isAuthorized(event: APIGatewayProxyEvent) {
  const groups = event.requestContext.authorizer?.claims['cognito:groups'];
  if (groups) {
    return (groups as string).includes('admins')
  } else {
    return false;
  }
}

export { handler };
