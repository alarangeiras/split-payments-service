import { SNSClient } from '@aws-sdk/client-sns';
import awsParams from './aws';

const snsClient = new SNSClient(awsParams);

export default snsClient;
