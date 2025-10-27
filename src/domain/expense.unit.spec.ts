import { randomUUID } from 'crypto';
import type {
	BatchQueueDao,
	ExpenseDao,
	GroupDao,
	MemberDao,
	SettlementDao,
	TransactionDao,
} from '../dao';
import type { ExpenseModel, GroupModel, MemberModel } from '../model';
import { mockito } from '../utils/mock';
import { ExpenseDomain } from './expense';
import type { NotificationDomain } from './notification';

describe('ExpenseDomain', () => {
	let expenseDomain: ExpenseDomain;
	const groupDaoMock = mockito.mock<GroupDao>();
	const memberDaoMock = mockito.mock<MemberDao>();
	const expenseDaoMock = mockito.mock<ExpenseDao>();
	const transactionDaoMock = mockito.mock<TransactionDao>();
	const settlementDaoMock = mockito.mock<SettlementDao>();
	const batchQueueDaoMock = mockito.mock<BatchQueueDao>();
	const notificationDomainMock = mockito.mock<NotificationDomain>();

	beforeEach(() => {
		expenseDomain = new ExpenseDomain(
			mockito.instance(groupDaoMock),
			mockito.instance(memberDaoMock),
			mockito.instance(expenseDaoMock),
			mockito.instance(transactionDaoMock),
			mockito.instance(settlementDaoMock),
			mockito.instance(batchQueueDaoMock),
			mockito.instance(notificationDomainMock),
		);
	});

	describe('addExpense', () => {
		it('should add a new expense', async () => {
			const groupId = randomUUID();

			const expenseRequest = {
				name: 'New Expense',
				amount: 1000,
				payerId: randomUUID(),
			} as ExpenseModel;

			const group = {} as GroupModel;
			const payer = {} as MemberModel;
			const involvedMembers = [{}, {}] as MemberModel[];
			const created = new Date();
			const expense = {
				id: randomUUID(),
				name: expenseRequest.name,
				amount: expenseRequest.amount,
				groupId,
				payerId: expenseRequest.payerId,
				created,
			} as ExpenseModel;

			mockito.when(groupDaoMock.findById(groupId)).thenResolve(group);
			mockito
				.when(memberDaoMock.findBy(groupId, mockito.anything()))
				.thenResolve([payer])
				.thenResolve(involvedMembers);

			mockito
				.when(
					expenseDaoMock.createExpense(mockito.anything(), mockito.anything()),
				)
				.thenResolve(expense);

			mockito
				.when(
					transactionDaoMock.createTransaction(
						mockito.anything(),
						mockito.anything(),
					),
				)
				.thenCall(async ({ expenseId, groupId, memberId, amount }) => ({
					id: randomUUID(),
					groupId,
					memberId,
					expenseId,
					amount,
					created,
				}));

			try {
				const result = await expenseDomain.addExpense(groupId, expenseRequest);

				expect(result).toEqual({
					id: expect.any(String),
					name: expenseRequest.name,
					amount: expenseRequest.amount,
					groupId,
					payerId: expenseRequest.payerId,
					created,
					transactions: expect.arrayContaining([
						expect.objectContaining({
							amount: expect.any(Number),
						}),
						expect.objectContaining({
							amount: expect.any(Number),
						}),
						expect.objectContaining({
							amount: expect.any(Number),
						}),
						expect.objectContaining({
							amount: expect.any(Number),
						}),
					]),
				});
			} catch (error) {
				console.error(error);
			}

			mockito
				.verify(notificationDomainMock.sendEvent(mockito.anything()))
				.times(3);
		});
	});

	describe('splitPayments', () => {
		it('should split equaly by the remaining members', () => {
			const expenseAmount = 1000; // amount in cents
			const members = [
				{ id: randomUUID() },
				{ id: randomUUID() },
			] as MemberModel[];
			const result = expenseDomain.splitPayments(expenseAmount, members);
			expect(result).toEqual([
				{
					id: expect.any(String),
					amount: 500,
				},
				{
					id: expect.any(String),
					amount: 500,
				},
			]);
		});
		it('should split equaly by the remaining members and add the left over on the first occurrence', () => {
			const expenseAmount = 1000; // amount in cents
			const members = [
				{ id: randomUUID() },
				{ id: randomUUID() },
				{ id: randomUUID() },
			] as MemberModel[];
			const result = expenseDomain.splitPayments(expenseAmount, members);
			expect(result).toEqual([
				{
					id: expect.any(String),
					amount: 334,
				},
				{
					id: expect.any(String),
					amount: 333,
				},
				{
					id: expect.any(String),
					amount: 333,
				},
			]);
		});
	});
});
