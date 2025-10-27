import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import db from '../config/knex';
import type { MemberDBModel, MemberModel } from '../model/member';

const TABLE_NAME = 'members';

export class MemberDao {
	constructor(private readonly knex: Knex) {}

	async create(groupId: string, member: Omit<MemberModel, 'id' | 'groupId'>) {
		const id = randomUUID();
		await this.knex.table(TABLE_NAME).insert({
			...member,
			id,
			group_id: groupId,
		});

		return this.mapToModel(await db.table(TABLE_NAME).where('id', id).first());
	}

	async findBy(
		groupId: string,
		criteria?: {
			includedMembers?: string[];
			excludedMembers?: string[];
		},
	) {
		const query = this.knex
			.table<MemberDBModel>(TABLE_NAME)
			.where('group_id', groupId);

		if (criteria?.includedMembers?.length) {
			query.whereIn('id', criteria?.includedMembers);
		}

		if (criteria?.excludedMembers?.length) {
			query.whereNotIn('id', criteria?.excludedMembers);
		}

		const result = await query;
		return result.map((db) => this.mapToModel(db));
	}

	private mapToModel(dbModel: MemberDBModel): MemberModel {
		return {
			id: dbModel.id,
			name: dbModel.name,
			email: dbModel.email,
			groupId: dbModel.group_id,
		};
	}
}

export const buildMemberDao = () => new MemberDao(db);
