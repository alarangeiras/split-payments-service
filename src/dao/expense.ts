import { randomUUID } from 'node:crypto';
import type knex from 'knex';
import type { Knex } from 'knex';
import db from '../config/knex';
import type { ExpenseDBModel, ExpenseModel } from '../model/expense';

export class ExpenseDao {
	constructor(private readonly knex: Knex) {}

	async createExpense(
		params: { groupId: string; name: string; payerId: string; amount: number },
		trx: knex.Knex.Transaction,
	) {
		const id = randomUUID();
		await trx.table('expenses').insert({
			id,
			name: params.name,
			amount: params.amount,
			group_id: params.groupId,
			payer_id: params.payerId,
		});

		const result = await trx
			.table<ExpenseDBModel>('expenses')
			.where('id', id)
			.first();
		return this.mapToModel(result);
	}

	async findById(expenseId: string) {
		const result = await this.knex
			.table<ExpenseDBModel>('expenses')
			.where('id', expenseId)
			.first();

		if (!result) return null;
		return this.mapToModel(result);
	}
	private mapToModel(db: ExpenseDBModel): ExpenseModel {
		return {
			id: db.id,
			name: db.name,
			amount: db.amount,
			groupId: db.group_id,
			payerId: db.payer_id,
			created: db.created,
		};
	}
}

export const buildExpenseDao = () => new ExpenseDao(db);
