import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("settlements", (table) => {
		table.uuid("id").primary();
		table.uuid("group_id").notNullable();
		table.uuid("sender_id").notNullable();
		table.uuid("receiver_id").notNullable();
		table.uuid("expense_id").notNullable();
		table.bigint("amount").notNullable();
		table.dateTime("created").defaultTo("NOW()");

		table.foreign("group_id").references("groups.id");
		table.foreign("sender_id").references("members.id");
		table.foreign("receiver_id").references("members.id");
		table.foreign("expense_id").references("expenses.id");
	});
}

export async function down(knex: Knex): Promise<void> {
	knex.schema.dropTable("settlements");
}
