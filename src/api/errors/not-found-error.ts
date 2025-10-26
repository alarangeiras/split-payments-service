import { StatusCodes } from "http-status-codes";
import type { ApiData } from "../../types/api-data";
import { ApiError } from "./api-error";

export class NotFoundError extends ApiError {
	constructor(message?: string, data?: ApiData) {
		super(StatusCodes.NOT_FOUND, message ?? "Entity not found", { data });
	}
}
