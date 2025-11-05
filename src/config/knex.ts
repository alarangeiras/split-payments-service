import knex from 'knex';
import config from './config';
import { DatabaseConfig } from './types';

const dbConfig = config.get<DatabaseConfig>('database');

const db = knex({
	client: 'pg',
	connection: {
		host: dbConfig.host,
		port: dbConfig.port,
		user: dbConfig.username,
		database: dbConfig.database,
		password: dbConfig.password,
	},
});

export default db;
