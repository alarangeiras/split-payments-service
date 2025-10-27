import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';

export class SettlementDao {
	async create(
		params: {
			senderId: string;
			receiverId: string;
			expenseId: string;
			groupId: string;
			amount: number;
		},
		trx: Knex.Transaction,
	) {
		const id = randomUUID();
		await trx.table('settlements').insert({
			id,
			sender_id: params.senderId,
			receiver_id: params.receiverId,
			group_id: params.groupId,
			expense_id: params.expenseId,
			amount: params.amount,
		});
	}
}

export const buildSettlementDao = () => new SettlementDao();
