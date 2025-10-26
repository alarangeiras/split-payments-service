import z from "zod";
import { BadRequestError } from "../api/errors/bad-request-error";
import { validate } from "./request-validation";

describe("request-validation", () => {
	describe("validate", () => {
		it("should validate", () => {
			const nextFunction = jest.fn();
			validate(
				z.object({
					name: z.string(),
				}),
				{
					name: "Dummy",
				},
				nextFunction,
			);
			expect(nextFunction).toHaveBeenCalled();
		});
		it("should invalidate the object", () => {
			const nextFunction = jest.fn();
			expect(() =>
				validate(
					z.object({
						name: z.string(),
					}),
					{},
					nextFunction,
				),
			).toThrow(BadRequestError);
			expect(nextFunction).not.toHaveBeenCalled();
		});
	});
});
