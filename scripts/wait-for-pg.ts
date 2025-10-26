import { Client } from "pg";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = parseInt(process.env.DB_PORT || "5433", 10);
const DB_USER = process.env.DB_USER || "split_service_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "split_service_pass";
const DB_NAME = process.env.DB_NAME || "split-service";

const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 1000;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkPostgresConnection(): Promise<boolean> {
	const client = new Client({
		user: DB_USER,
		host: DB_HOST,
		database: DB_NAME,
		password: DB_PASSWORD,
		port: DB_PORT,
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
		`Waiting for PostgreSQL on ${DB_HOST}:${DB_PORT}...`,
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
		`\nFailed to connecto to PostgreSQL on ${DB_HOST}:${DB_PORT} after ${MAX_RETRIES} tries.`,
	);
	process.exit(1);
}

waitForPostgres();
