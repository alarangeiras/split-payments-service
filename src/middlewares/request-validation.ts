import type { NextFunction, Request, Response } from "express";
import type z from "zod";
import { ZodError } from "zod";
import { BadRequestError } from "../api/errors/bad-request-error";
import { InternalServerError } from "../api/errors/internal-server-error";

export function validate(
	schema: z.ZodObject<any, any>,
	content: any,
	next: NextFunction,
) {
	try {
		schema.parse(content);
		next();
	} catch (error) {
		if (error instanceof ZodError) {
			const errorMessages = error.issues.map((issue: any) => ({
				message: `${issue.path.join(".")} is ${issue.message}`,
			}));
			throw new BadRequestError("Invalid data", errorMessages);
		} else {
			throw new InternalServerError("Api Error", error);
		}
	}
}

export function validateBody(schema: z.ZodObject<any, any>) {
	return (req: Request, _res: Response, next: NextFunction) => {
		validate(schema, req.body, next);
	};
}

export function validatePathParam(schema: z.ZodObject<any, any>) {
	return (req: Request, _res: Response, next: NextFunction) => {
		validate(schema, req.params, next);
	};
}
