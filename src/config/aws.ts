import config from "./config";
import { AwsConfig } from "./types";

const awsConfig = config.get<AwsConfig>('aws');
const localstackEndpoint = config.get<string>('localstack.endpoint');

let awsParams: any = {
	region: awsConfig.region,
	credentials: {
		accessKeyId: awsConfig.accessKeyId,
		secretAccessKey: awsConfig.secretAccessKey,
	},
};

if (['dev', 'test'].includes(process.env.NODE_ENV ?? '')) {
	awsParams = {
		region: awsConfig.region,
		endpoint: localstackEndpoint,
		s3ForcePathStyle: true,
		credentials: {
			accessKeyId: awsConfig.accessKeyId,
			secretAccessKey: awsConfig.secretAccessKey,
		},
	};
}

export default awsParams;