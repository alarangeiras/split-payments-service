import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import db from '../config/knex';
import type { GroupModel } from '../model/group';
import type { Nullable } from '../utils/object';

const TABLE_NAME = 'groups';

export class GroupDao {
	constructor(private readonly knex: Knex) {}

	async findById(uid: string): Promise<Nullable<GroupModel>> {
		return this.knex.table(TABLE_NAME).where('id', uid).first();
	}

	async create(group: Omit<GroupModel, 'id'>): Promise<GroupModel> {
		const id = randomUUID();
		await this.knex.table(TABLE_NAME).insert({
			...group,
			id,
		});
		return this.knex.table(TABLE_NAME).where('id', id).first();
	}
}

export const buildGroupDao = () => new GroupDao(db);
