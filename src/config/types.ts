export type DatabaseConfig = {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
}

export type AwsConfig = {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sns: {
      notification: string;
    };
    s3: {
      bucketName: string;
      expensesFolder: string;
    };
}

export type RedisConfig = {
    uri: string;
}

export type LoggingConfig = {
    level: string;
}

