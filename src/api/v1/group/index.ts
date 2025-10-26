import { type Request, type Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { buildGroupDomain } from "../../../domain/group";
import {
	validateBody,
	validatePathParam,
} from "../../../middlewares/request-validation";
import { AddGroupMember, CreateGroup } from "../group/validation";

const router = Router();
const groupDomain = buildGroupDomain();

router.post(
	"/",
	validateBody(CreateGroup),
	async (req: Request, res: Response) => {
		const group = CreateGroup.parse(req.body);
		const result = await groupDomain.create(group);
		res.status(StatusCodes.CREATED).send(result);
	},
);

router.get(
	"/:id",
	validatePathParam(z.object({ id: z.uuid() })),
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const response = await groupDomain.find(id);
		res.json(response);
	},
);

router.post(
	"/:id/create-member",
	validatePathParam(z.object({ id: z.uuid() })),
	validateBody(AddGroupMember),
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const groupMember = AddGroupMember.parse(req.body);
		const response = await groupDomain.createMember(id, groupMember);
		res.status(StatusCodes.CREATED).send(response);
	},
);

router.get(
	"/:id/members",
	validatePathParam(z.object({ id: z.uuid() })),
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const response = await groupDomain.getMembers(id);
		res.send(response);
	},
);

export default router;
