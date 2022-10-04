import { v4 } from "uuid";
import { S3 } from 'aws-sdk';

const S3Client = new S3() //new s3 client


async function handler(event: any, context: any) {
    const buckets = await S3Client.listBuckets().promise(); // return all of the buckets
    console.log('Got an event:');
    console.log(event)
  return {
    statusCode: 200,
    body: "Here are our buckets" + JSON.stringify(buckets.Buckets),
  };
}

export { handler };
