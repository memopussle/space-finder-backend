import { APIGatewayProxyEvent } from "aws-lambda";

export function generateRandomId(): string {
  return Math.random().toString(36).slice(2); //get a random id
}

export function getEventBody(event: APIGatewayProxyEvent) {
  return typeof event.body == "object" ? event.body : JSON.parse(event.body);
}
