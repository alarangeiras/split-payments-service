export enum NotificationType {
	EMAIL = "EMAIL",
}

export enum NotificationTemplate {
	NEW_EXPENSE_RECORDED = "NEW_EXPENSE_RECORDED",
	DEBT_SETTLED = "DEBT_SETTLED",
}

export type NotificationEvent = {
	type: NotificationType;
	destination: string;
	template: NotificationTemplate;
	metadata?: {
		[key: string]: string | boolean | Date | number;
	};
};
