import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("batch-queue", (table) => {
		table.uuid("id").primary();
		table.uuid("group_id").notNullable();
		table.string("reason").notNullable();
		table.string("file_key").notNullable();
		table.dateTime("created").defaultTo("NOW()");
        table.dateTime("processed");

		table.foreign("group_id").references("groups.id");
	});
}

export async function down(knex: Knex): Promise<void> {
	knex.schema.dropTable("batch-queue");
}
