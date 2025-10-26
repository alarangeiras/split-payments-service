import dotenv from "dotenv";
import type { Knex } from "knex";

if (process.env.NODE_ENV === "dev") dotenv.config();

const defaultConfig: Knex.Config = {
	client: "pg",
	connection: {
		host: process.env.DB_HOST ?? "localhost",
		port: Number(process.env.DB_PORT ?? 5432),
		user: process.env.DB_USER,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
	},
	migrations: {
		tableName: "knex_migrations",
	},
};

const config: { [key: string]: Knex.Config } = {
	dev: defaultConfig,

	test: {
		...defaultConfig,
		connection: {
			host: "localhost",
			port: 5433,
			user: "split_service_user",
			database: "split-service",
			password: "split_service_pass",
		},
	},

	staging: defaultConfig,

	production: defaultConfig,
};

module.exports = config;
