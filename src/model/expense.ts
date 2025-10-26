export type ExpenseDBModel = {
	id: string;
	name: string;
	amount: number;
	group_id: string;
	payer_id: string;
	created: Date;
};

export type ExpenseModel = {
	id: string;
	name: string;
	amount: number;
	groupId: string;
	payerId: string;
	created: Date;
};
