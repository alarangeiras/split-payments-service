import { randomUUID } from "node:crypto";
import db from "../../../config/knex";
import supertest from "../../../config/supertest";

describe("/v1/group", () => {
	describe("POST /", () => {
		it("should persist a new group", async () => {
			const response = await supertest.post("/v1/group").send({
				name: "Dummy group",
			});
			expect(response.status).toBe(201);
			await expect(
				db.table("groups").where("id", response.body.id).first(),
			).toBeDefined();
		});
		it("should receive a 400 when the payload is not correct", async () => {
			const response = await supertest.post("/v1/group").send({});
			expect(response.status).toBe(400);
		});
	});

	describe("GET /:id", () => {
		it("should fetch a recently added group", async () => {
			const response = await supertest.post("/v1/group").send({
				name: "Dummy group",
			});

			const fetchResponse = await supertest.get(
				`/v1/group/${response.body.id}`,
			);
			expect(fetchResponse.status).toBe(200);
			expect(fetchResponse.body).toEqual(response.body);
		});
		it("should receive a not found when the group does not exists", async () => {
			const fetchResponse = await supertest.get(`/v1/group/${randomUUID()}`);
			expect(fetchResponse.status).toBe(404);
		});
	});

	describe("POST /:id/create-member", () => {
		it("should fetch a recently added group", async () => {
			const response = await supertest.post("/v1/group").send({
				name: "Dummy group",
			});

			const memberResponse = await supertest
				.post(`/v1/group/${response.body.id}/create-member`)
				.send({
					name: "New Member",
					email: "dummy@gmail.com",
				});
			expect(memberResponse.status).toBe(201);
		});
		it("should receive a 400 when the payload is not correct", async () => {
			const response = await supertest.post("/v1/group").send({
				name: "Dummy group",
				email: "dummy@gmail.com",
			});

			const memberResponse = await supertest
				.post(`/v1/group/${response.body.id}/create-member`)
				.send({});
			expect(memberResponse.status).toBe(400);
		});
		it("should receive a not found when the group does not exists", async () => {
			const fetchResponse = await supertest
				.post(`/v1/group/${randomUUID()}/create-member`)
				.send({
					name: "New Member",
					email: "dummy@gmail.com",
				});
			expect(fetchResponse.status).toBe(404);
		});
	});
	describe("GET /:id/members", () => {
		it("should fetch all members", async () => {
			const response = await supertest.post("/v1/group").send({
				name: "Dummy group",
			});

			await supertest.post(`/v1/group/${response.body.id}/create-member`).send({
				name: "New Member 1",
				email: "dummy@gmail.com",
			});
			await supertest.post(`/v1/group/${response.body.id}/create-member`).send({
				name: "New Member 2",
				email: "dummy@gmail.com",
			});

			const membersResponse = await supertest.get(
				`/v1/group/${response.body.id}/members`,
			);
			expect(membersResponse.status).toBe(200);
			expect(membersResponse.body).toEqual([
				{
					id: expect.any(String),
					name: "New Member 1",
					email: expect.any(String),
					groupId: response.body.id,
				},
				{
					id: expect.any(String),
					name: "New Member 2",
					email: expect.any(String),
					groupId: response.body.id,
				},
			]);
		});
	});
});
