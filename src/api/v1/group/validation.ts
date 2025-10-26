import z from "zod";

export const CreateGroup = z.object({
	name: z.string(),
});

export const AddGroupMember = z.object({
	name: z.string(),
	email: z.email(),
});
