import { Client } from "pg";

import config from 'config';

const dbConfig = config.get<{ host: string; port: number; username: string; password: string; database: string }>('database');

const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 1000;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkPostgresConnection(): Promise<boolean> {
	const client = new Client({
		user: dbConfig.username,
		host: dbConfig.host,
		database: dbConfig.database,
		password: dbConfig.password,
		port: dbConfig.port,
		connectionTimeoutMillis: 5000,
	});

	try {
		await client.connect();
		await client.query("SELECT 1");
		await client.end();
		return true;
	} catch (error) {
		try {
			await client.end();
		} catch {}
		return false;
	}
}

async function waitForPostgres(): Promise<void> {
	console.log(
		`Waiting for PostgreSQL on ${dbConfig.host}:${dbConfig.port}...`,
	);

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		if (await checkPostgresConnection()) {
			console.log("\nPostgreSQL is ready");
			return;
		}

		if (attempt < MAX_RETRIES) {
			console.log(
				`Failed: ${attempt}/${MAX_RETRIES}, waiting ${RETRY_INTERVAL_MS}ms before trying again.`,
			);
			await delay(RETRY_INTERVAL_MS);
		}
	}

	console.error(
		`\nFailed to connecto to PostgreSQL on ${dbConfig.host}:${dbConfig.port} after ${MAX_RETRIES} tries.`,
	);
	process.exit(1);
}

waitForPostgres();
