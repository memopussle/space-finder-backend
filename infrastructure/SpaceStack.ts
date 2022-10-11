import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AuthorizerWrapper } from "./auth/AuthorizerWrapper";
import { join } from "path";
import { AuthorizationType, LambdaIntegration, MethodOptions, RestApi } from "aws-cdk-lib/aws-apigateway";
import { GenericTable } from "./GenericTable";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";


export class SpaceStack extends Stack {
  // private: only accessible within class
  private api = new RestApi(this, "SpaceApi");
  private authorizer: AuthorizerWrapper;

  private spacesTable = new GenericTable(this, {
    tableName: "SpacesTable",
    primaryKey: "spaceId",
    createLambdaPath: "Create",
    readLambdaPath: "Read",
    updateLambdaPath: "Update",
    deleteLambdaPath: "Delete",
    secondaryIndexes: ["location"],
  });

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // call AuthorizerWrapper
    this.authorizer = new AuthorizerWrapper(this, this.api);

    // change the argument how the service is inherited
    // this: reference arguments in super. after are arguments passed in

    const helloLambdaNodeJs = new NodejsFunction(this, "helloLambdaNodeJs", {
      entry: join(__dirname, "..", "services", "node-lambda", "hello.ts"), //mapping hello.ts to SpaceStack.ts
      handler: "handler",
    });

    // provide permissions to list for helloLambdaNodejs
    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions("s3:ListAllMyBuckets");
    s3ListPolicy.addResources("*");
    helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

    //authorization
    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId
      }
    }

    // Hello Api lambda intergration:
    const helloLambdaIntergration = new LambdaIntegration(helloLambdaNodeJs); // link API Gateways and Lambda
    const helloLambdaResource = this.api.root.addResource("hello");
    helloLambdaResource.addMethod(
      "GET",
      helloLambdaIntergration,
      optionsWithAuthorizer
    ); // pass authorization to get hello method

    //Spaces API intergrations:
    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.spacesTable.createLambdaIntegration);
    spaceResource.addMethod("GET", this.spacesTable.readLambdaIntegration);
    spaceResource.addMethod("PUT", this.spacesTable.updateLambdaIntegration);
    spaceResource.addMethod("DELETE", this.spacesTable.deleteLambdaIntegration);
  }
}

// -> the ouput will be in cdk.out
