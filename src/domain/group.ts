import { NotFoundError } from '../api/errors/not-found-error';
import {
	buildGroupDao,
	buildMemberDao,
	type GroupDao,
	type MemberDao,
} from '../dao';
import type { GroupModel, MemberModel } from '../model';

export class GroupDomain {
	constructor(
		private readonly groupDao: GroupDao,
		private readonly memberDao: MemberDao,
	) {}

	async create(group: Omit<GroupModel, 'id'>) {
		return await this.groupDao.create(group);
	}

	async find(id: string) {
		const group = await this.groupDao.findById(id);
		if (!group) throw new NotFoundError('group not found');

		return group;
	}

	async createMember(
		groupId: string,
		member: Omit<MemberModel, 'id' | 'groupId'>,
	) {
		await this.find(groupId);

		return this.memberDao.create(groupId, member);
	}

	async addExistingMember(
		groupId: string,
		member: Omit<MemberModel, 'id' | 'groupId'>,
	) {
		await this.find(groupId);

		return this.memberDao.create(groupId, member);
	}

	async getMembers(groupId: string) {
		await this.find(groupId);

		return this.memberDao.findBy(groupId);
	}
}

export const buildGroupDomain = () =>
	new GroupDomain(buildGroupDao(), buildMemberDao());
