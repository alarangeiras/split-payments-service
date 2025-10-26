import { StatusCodes } from "http-status-codes";
import type { ApiData } from "../../types/api-data";
import { ApiError } from "./api-error";

export class PreconditionFailedError extends ApiError {
    constructor(message: string, data?: ApiData) {
        super(StatusCodes.PRECONDITION_FAILED, message, { data });
    }
}
