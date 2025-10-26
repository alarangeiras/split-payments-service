import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../api/errors/api-error";
import { InternalServerError } from "../api/errors/internal-server-error";

export function handleApiErrors() {
	return (_error: Error, _req: Request, res: Response, _next: NextFunction) => {
		const error =
			_error instanceof ApiError
				? _error
				: new InternalServerError("Internal Server Error", _error);
		return res.status(error.getStatusCode()).send(error.toJSON());
	};
}
