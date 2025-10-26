import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("groups", (table) => {
		table.uuid("id").primary();
		table.string("name").notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("groups");
}
