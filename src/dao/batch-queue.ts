import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import db from '../config/knex';
import type { ReasonTypes } from '../types/reason';

export class BatchQueueDao {
	constructor(private readonly knex: Knex) {}
	async create(params: {
		groupId: string;
		fileKey: string;
		reason: ReasonTypes;
	}) {
		const id = randomUUID();
		await this.knex('batch-queue').insert({
			id,
			group_id: params.groupId,
			reason: params.reason,
			file_key: params.fileKey,
		});
	}
}

export const buildBatchQueueDao = () => new BatchQueueDao(db);
