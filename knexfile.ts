import dotenv from "dotenv";
import type { Knex } from "knex";
import config from 'config';

const dbConfig = config.get<{ host: string; port: number; username: string; password: string; database: string }>('database');

if (process.env.NODE_ENV === "dev") dotenv.config();

const defaultConfig: Knex.Config = {
  client: "pg",
  connection: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    database: dbConfig.database,
    password: dbConfig.password
  },
  migrations: {
    tableName: "knex_migrations",
  },
};

const knexConfig: { [key: string]: Knex.Config } = {
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

module.exports = knexConfig;
