import knex from "knex";

const db = knex({
	client: "pg",
	connection: {
		host: process.env.DB_HOST ?? "localhost",
		port: Number(process.env.DB_PORT ?? 5432),
		user: process.env.DB_USER,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
	},
});

export default db;
