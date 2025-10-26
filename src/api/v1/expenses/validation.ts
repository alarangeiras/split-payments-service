import z from "zod";

export const ExpenseValidation = z.object({
	name: z.string(),
	amount: z.number(),
	payerId: z.uuid(),
	involvedMembers: z.array(z.uuid()).optional(),
});

export const SettlementValidation = z.object({
	senderId: z.uuid(),
	receiverId: z.uuid(),
	expenseId: z.uuid(),
	amount: z.number(),
});