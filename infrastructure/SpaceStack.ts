import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Code,
  Function as LambdaFunction,
  Runtime,
} from "aws-cdk-lib/aws-lambda"; // extend library fromcdk
import { join } from "path";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";

export class SpaceStack extends Stack {
  // private: only accessible within class
  private api = new RestApi(this, "SpaceApi");

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // change the argument how the service is inherited
    // this: reference arguments in super. after are arguments passed in
    const helloLambda = new LambdaFunction(this, "helloLambda", {
      runtime: Runtime.NODEJS_16_X, // version
      code: Code.fromAsset(join(__dirname, "..", "services", "hello")), //mapping hello.js to SpaceStack.ts
      handler: "hello.main",
    });

    // Hello Api lambda intergration:
    const helloLambdaIntergration = new LambdaIntegration(helloLambda); // link API Gateways and Lambda
    const helloLambdaResource = this.api.root.addResource('hello'); 
    helloLambdaResource.addMethod('GET', helloLambdaIntergration)
  }
}

// -> the ouput will be in cdk.out
