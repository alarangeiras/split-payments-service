import { randomUUID } from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Duration } from 'luxon';
import { NotFoundError, PreconditionFailedError } from '../api/errors';
import db from '../config/knex';
import s3Client from '../config/s3';
import {
	type BatchQueueDao,
	buildBatchQueueDao,
	buildExpenseDao,
	buildGroupDao,
	buildMemberDao,
	buildSettlementDao,
	buildTransactionDao,
	type ExpenseDao,
	type GroupDao,
	type MemberDao,
	type SettlementDao,
	type TransactionDao,
} from '../dao';
import type { ExpenseModel, MemberModel } from '../model';
import { NotificationTemplate, NotificationType } from '../types/notification';
import { ReasonTypes } from '../types/reason';
import { ensureArray } from '../utils/array';
import {
	buildNotificationDomain,
	type NotificationDomain,
} from './notification';

export class ExpenseDomain {
	constructor(
		private readonly groupDao: GroupDao,
		private readonly memberDao: MemberDao,
		private readonly expenseDao: ExpenseDao,
		private readonly transactionDao: TransactionDao,
		private readonly settlementDao: SettlementDao,
		private readonly batchQueuDao: BatchQueueDao,
		private readonly notificationDomain: NotificationDomain,
	) {}

	async addExpense(
		groupId: string,
		expense: Pick<ExpenseModel, 'name' | 'amount' | 'payerId'> & {
			involvedMembers?: string[];
		},
	) {
		const {
			payerId,
			amount: expenseAmount,
			name,
			involvedMembers: _involvedMembers,
		} = expense;
		const group = await this.groupDao.findById(groupId);
		if (!group) throw new NotFoundError('Group not found', { groupId });

		const [payer] = await this.memberDao.findBy(groupId, {
			includedMembers: [payerId],
		});

		if (!payer)
			throw new NotFoundError('Payer not found in the group', {
				groupId,
				payerId: payerId,
			});

		const involvedMembers = ensureArray(_involvedMembers);

		const members = await this.memberDao.findBy(groupId, {
			includedMembers: involvedMembers,
			excludedMembers: [payerId],
		});

		if (!members?.length) {
			throw new PreconditionFailedError('No member found in the group', {
				groupId,
				...(involvedMembers?.length ? { involvedMembers } : {}),
			});
		}

		const splitedDestinations = this.splitPayments(expense.amount, members);

		const result = await db.transaction(async (transaction) => {
			const expense = await this.expenseDao.createExpense(
				{
					groupId,
					payerId,
					name,
					amount: expenseAmount,
				},
				transaction,
			);
			const payerTransaction = await this.transactionDao.createTransaction(
				{
					expenseId: expense.id,
					groupId,
					memberId: payerId,
					amount: -expenseAmount,
				},
				transaction,
			);
			const transactions = [payerTransaction];
			for (const destination of splitedDestinations) {
				const memberTransaction = await this.transactionDao.createTransaction(
					{
						expenseId: expense.id,
						groupId,
						memberId: destination.id,
						amount: +destination.amount,
					},
					transaction,
				);
				transactions.push(memberTransaction);
			}
			return {
				...expense,
				transactions,
			};
		});

		await this.notificationDomain.sendEvent({
			type: NotificationType.EMAIL,
			template: NotificationTemplate.NEW_EXPENSE_RECORDED,
			destination: payer.email,
			metadata: {
				name: payer.name,
				amount: -expenseAmount,
			},
		});

		for (const destination of splitedDestinations) {
			await this.notificationDomain.sendEvent({
				type: NotificationType.EMAIL,
				template: NotificationTemplate.NEW_EXPENSE_RECORDED,
				destination: destination.email,
				metadata: {
					name: destination.name,
					amount: destination.amount,
				},
			});
		}

		return result;
	}

	splitPayments(expenseAmount: number, members: Array<MemberModel>) {
		const totalToSplit = members.length;
		const rawSplitValue = expenseAmount / totalToSplit;
		const leftOverAmount = Number.isInteger(rawSplitValue) ? 0 : 1;
		const finalAmount = Math.floor(rawSplitValue);
		return members.map((member, idx) => ({
			...member,
			amount: finalAmount + (idx === 0 ? leftOverAmount : 0),
		}));
	}

	async getBalances(groupId: string) {
		const group = await this.groupDao.findById(groupId);
		if (!group) throw new NotFoundError('Group not found', { groupId });

		return await this.transactionDao.getBalancesByGroup(groupId);
	}

	async registerSettlement(
		groupId: string,
		senderId: string,
		receiverId: string,
		expenseId: string,
		amount: number,
	) {
		const group = await this.groupDao.findById(groupId);
		if (!group) throw new NotFoundError('Group not found', { groupId });

		const expense = this.expenseDao.findById(expenseId);
		if (!expense)
			throw new NotFoundError('Expense not found', {
				groupId,
				senderId,
			});

		const [sender] = await this.memberDao.findBy(group.id, {
			includedMembers: [senderId],
		});

		if (!sender)
			throw new NotFoundError('Sender not found in the group', {
				groupId,
				senderId,
			});

		const [receiver] = await this.memberDao.findBy(group.id, {
			includedMembers: [receiverId],
		});

		if (!receiver)
			throw new NotFoundError('Receiver not found in the group', {
				groupId,
				receiverId,
			});

		await db.transaction(async (transaction) => {
			await this.settlementDao.create(
				{
					expenseId,
					senderId,
					groupId,
					receiverId,
					amount: amount,
				},
				transaction,
			);
			await this.transactionDao.createTransaction(
				{
					expenseId,
					groupId,
					memberId: senderId,
					amount: -amount,
				},
				transaction,
			);
			await this.transactionDao.createTransaction(
				{
					expenseId,
					groupId,
					memberId: receiverId,
					amount: +amount,
				},
				transaction,
			);
		});

		await this.notificationDomain.sendEvent({
			type: NotificationType.EMAIL,
			template: NotificationTemplate.DEBT_SETTLED,
			destination: sender.email,
			metadata: {
				name: sender.name,
				amount: -amount,
			},
		});

		await this.notificationDomain.sendEvent({
			type: NotificationType.EMAIL,
			template: NotificationTemplate.DEBT_SETTLED,
			destination: receiver.email,
			metadata: {
				name: receiver.name,
				amount: +amount,
			},
		});
	}

	async requestUpload(groupId: string) {
		const group = await this.groupDao.findById(groupId);
		if (!group) throw new NotFoundError('Group not found', { groupId });

		const fileUniqueId = randomUUID();
		const fileKey = `expenses/${fileUniqueId}.csv`;

		const command = new PutObjectCommand({
			Bucket: 'split-service-storage',
			Key: fileKey,
			ContentType: 'text/csv',
		});

		const expiration = Duration.fromObject({ hour: 1 }).shiftTo('seconds');
		const url = await getSignedUrl(s3Client, command, {
			expiresIn: expiration.seconds,
		});

		await this.batchQueuDao.create({
			groupId,
			reason: ReasonTypes.EXPENSES_BATCH_UPLOAD,
			fileKey,
		});

		const message =
			'Please upload the CSV file to the pre-signed URL. Be aware the url will expire in 1 hour.';

		return {
			url,
			message,
		};
	}
}

export const buildExpenseDomain = () =>
	new ExpenseDomain(
		buildGroupDao(),
		buildMemberDao(),
		buildExpenseDao(),
		buildTransactionDao(),
		buildSettlementDao(),
		buildBatchQueueDao(),
		buildNotificationDomain(),
	);
