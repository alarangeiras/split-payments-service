import { StatusCodes } from "http-status-codes";
import { ApiError } from "./api-error";

export class InternalServerError extends ApiError {
	constructor(message: string, error?: Error | unknown) {
		super(StatusCodes.INTERNAL_SERVER_ERROR, message, { originalError: error });
	}
}
