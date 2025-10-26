import { StatusCodes } from "http-status-codes";
import type { ApiData } from "../../types/api-data";
import { ApiError } from "./api-error";

export class BadRequestError extends ApiError {
	constructor(message: string, data?: ApiData) {
		super(StatusCodes.BAD_REQUEST, message, { data });
	}
}
