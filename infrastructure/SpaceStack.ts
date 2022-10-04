import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Code,
  Function as LambdaFunction,
  Runtime,
} from "aws-cdk-lib/aws-lambda"; // extend library fromcdk
import { join } from "path";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { GenericTable } from "./GenericTable";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class SpaceStack extends Stack {
  // private: only accessible within class
  private api = new RestApi(this, "SpaceApi");
  private spacesTable = new GenericTable(
    'SpacesTable',
    'spaceId',
    this,
  )

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // change the argument how the service is inherited
    // this: reference arguments in super. after are arguments passed in

    const helloLambdaNodeJs = new NodejsFunction(this, "helloLambdaNodeJs", {
      entry: join(__dirname, "..", "services", "node-lambda", "hello.ts"), //mapping hello.ts to SpaceStack.ts
      handler: "handler",
    });
 
    // provide permissions to list for helloLambdaNodejs
    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions('s3:ListAllMyBuckets');
    s3ListPolicy.addResources('*')
    helloLambdaNodeJs.addToRolePolicy(s3ListPolicy)

    // Hello Api lambda intergration:
    const helloLambdaIntergration = new LambdaIntegration(helloLambdaNodeJs); // link API Gateways and Lambda
    const helloLambdaResource = this.api.root.addResource('hello'); 
    helloLambdaResource.addMethod('GET', helloLambdaIntergration)
  }
}

// -> the ouput will be in cdk.out
