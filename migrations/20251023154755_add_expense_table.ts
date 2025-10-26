import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("expenses", (table) => {
		table.uuid("id").primary();
		table.string("name").notNullable();
		table.bigint("amount").notNullable();
		table.uuid("group_id").notNullable();
		table.uuid("payer_id").notNullable();
		table.dateTime("created").defaultTo("NOW()");

		table.foreign("group_id").references("groups.id");
		table.foreign("payer_id").references("members.id");
	});
}

export async function down(knex: Knex): Promise<void> {
	knex.schema.dropTable("expenses");
}
