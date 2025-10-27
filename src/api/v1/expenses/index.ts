import { type Request, type Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';
import { buildExpenseDomain } from '../../../domain';
import {
	validateBody,
	validatePathParam,
} from '../../../middlewares/request-validation';
import { cache, expireCache } from '../../../utils/cache';
import { ExpenseValidation, SettlementValidation } from './validation';

const router = Router();

const expenseDomain = buildExpenseDomain();

router.post(
	'/:groupId',
	validatePathParam(
		z.object({
			groupId: z.uuid(),
		}),
	),
	validateBody(ExpenseValidation),
	async (req: Request, res: Response) => {
		const groupId = req.params.groupId as string;
		const expense = ExpenseValidation.parse(req.body);
		const result = await expenseDomain.addExpense(groupId, expense);
		await expireCache(`balance/${groupId}`);
		res.status(StatusCodes.CREATED).json(result);
	},
);

router.post(
	'/:groupId/settlement',
	validatePathParam(
		z.object({
			groupId: z.uuid(),
		}),
	),
	validateBody(SettlementValidation),
	async (req: Request, res: Response) => {
		const groupId = req.params.groupId as string;
		const settlement = SettlementValidation.parse(req.body);
		const result = await expenseDomain.registerSettlement(
			groupId,
			settlement.senderId,
			settlement.receiverId,
			settlement.expenseId,
			settlement.amount,
		);
		await expireCache(`balance/${groupId}`);
		res.status(StatusCodes.CREATED).json(result);
	},
);

router.get(
	'/:groupId/balance',
	validatePathParam(
		z.object({
			groupId: z.uuid(),
		}),
	),

	async (req: Request, res: Response) => {
		const groupId = req.params.groupId as string;
		const result = await cache(
			`balance/${groupId}`,
			() => expenseDomain.getBalances(groupId),
			5000,
		);
		res.json(result);
	},
);

router.get(
	'/:groupId/request-upload',
	validatePathParam(
		z.object({
			groupId: z.uuid(),
		}),
	),
	async (req: Request, res: Response) => {
		const groupId = req.params.groupId as string;
		const response = await expenseDomain.requestUpload(groupId);
		res.json(response);
	},
);

export default router;
