import { S3Client } from "@aws-sdk/client-s3";

let params: any = {
	region: "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
};

if (["dev", "test"].includes(process.env.NODE_ENV ?? "")) {
	params = {
		region: "us-east-1",
		endpoint: process.env.LOCALSTACK_URL,
		s3ForcePathStyle: true,
		credentials: {
			accessKeyId: "test", // LocalStack default credentials
			secretAccessKey: "test",
		},
	};
}

const s3Client = new S3Client(params);

export default s3Client;
