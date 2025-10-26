import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("members", (table) => {
		table.uuid("id").primary();
		table.string("name").notNullable();
		table.string("email").notNullable();
		table.uuid("group_id").nullable();
		table.foreign("group_id").references("groups.id");
	});
}

export async function down(knex: Knex): Promise<void> {
	knex.schema.dropTable("members");
}
