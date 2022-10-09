import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../services/SpacesTable/Create";


const event: APIGatewayProxyEvent = {
  body: {
    name: 'someName'
  }
} as any;

// handler: a promise function -> pair with then-> then:result
const result = handler(event, {} as any).then((apiResult) => {
  if (apiResult.statusCode === 200) {
       const items = JSON.parse(apiResult.body);
   }
  
    console.log(123);
} );