import type { ApiData } from "../../types/api-data";

export class ApiError extends Error {
	constructor(
		private readonly statusCode: number,
		message: string,
		private readonly optional?: {
			data?: ApiData;
			originalError?: Error | any;
			addStack?: boolean;
		},
	) {
		super(message);
	}

	getStatusCode() {
		return this.statusCode;
	}

	toJSON() {
		const shouldAddStack = !!this.optional?.addStack;
		const alternativeStack = shouldAddStack ? this.stack : undefined;
		const stack = this.optional?.originalError?.stack ?? alternativeStack;
		return {
			statusCode: this.statusCode,
			message: this.message,
			data: this.optional?.data,
			stack,
		};
	}
}
