import { S3Client } from '@aws-sdk/client-s3';
import awsParams from './aws';

const s3Client = new S3Client(awsParams);

export default s3Client;
