export type TransactionDBModel = {
	id: string;
	group_id: string;
	member_id: string;
	expense_id: string;
	amount: number;
	created: Date;
};

export type TransactionModel = {
	id: string;
	groupId: string;
	memberId: string;
	expenseId: string;
	amount: number;
	created: Date;
};
