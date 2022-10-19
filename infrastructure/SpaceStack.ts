import { Stack, StackProps, Fn, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AuthorizerWrapper } from "./auth/AuthorizerWrapper";
import { join } from "path";
import {
  AuthorizationType,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { GenericTable } from "./GenericTable";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";

export class SpaceStack extends Stack {
  // private: only accessible within class
  private api = new RestApi(this, "SpaceApi");
  private authorizer: AuthorizerWrapper;
  private suffix: string; // naming our bucket
  private spacesPhotosBucket: Bucket;

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

    this.initializeSuffix();
    this.initializeSpacesPhotoBucket();

    // call AuthorizerWrapper after photobucket to creat photobucket first and pass it to authorize wrapper
    this.authorizer = new AuthorizerWrapper(
      this,
      this.api,
      this.spacesPhotosBucket.bucketArn + '/*' // this role cares about this bucket and all its content
    );

    // change the argument how the service is inherited
    // this: reference arguments in super. after are arguments passed in

    //authorization
    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId,
      },
    };

    //Spaces API intergrations:
    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.spacesTable.createLambdaIntegration);
    spaceResource.addMethod("GET", this.spacesTable.readLambdaIntegration);
    spaceResource.addMethod("PUT", this.spacesTable.updateLambdaIntegration);
    spaceResource.addMethod("DELETE", this.spacesTable.deleteLambdaIntegration);
  }

  private initializeSuffix() {
    // allows us access cloudformation resources from our stack
    const shortsStackId = Fn.select(2, Fn.split("/", this.stackId)); // ex: ad17cca80-417c-11ed-aafb-06b363124e12 stackid in cloudformation
    const Suffix = Fn.select(4, Fn.split("-", shortsStackId)); // ex: 06b363124e12
    this.suffix = Suffix;
  }

  //generate a new s3 photo bucket based on cloudformation suffix
  private initializeSpacesPhotoBucket() {
    this.spacesPhotosBucket = new Bucket(this, "spaces-photos", {
      bucketName: "spaces-photos-" + this.suffix,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });
    new CfnOutput(this, "spaces-photos-bucket-name", {
      value: this.spacesPhotosBucket.bucketName,
    });
  }
}

// -> the ouput will be in cdk.out
