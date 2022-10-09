import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../services/SpacesTable/Read";


const event: APIGatewayProxyEvent = {
  queryStringParameters: {
    spaceId: "b9bbfcd3-0e80-43d8-8b47-8a3f120fe0c0",
  },
} as any;

// handler: a promise function -> pair with then-> then:result
const result = handler(event, {} as any).then((apiResult) => {
    const items = JSON.parse(apiResult.body);
    console.log(123);
} );