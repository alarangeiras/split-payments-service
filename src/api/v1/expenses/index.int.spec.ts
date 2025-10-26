import supertest from "../../../config/supertest";

jest.setTimeout(15000);

describe("/v1/expense", () => {
	let groupId: string;
	const groupMembers: string[] = [];
	beforeAll(async () => {
		const groupResult = await supertest.post("/v1/group").send({
			name: "Spending Group",
		});

		groupId = groupResult.body.id as string;

		const members = Array(4)
			.fill(0)
			.map((_, idx) => `Group member ${idx + 1}`);

		for (const member of members) {
			const groupMemberResult = await supertest
				.post(`/v1/group/${groupId}/create-member`)
				.send({
					name: member,
					email: "dummy@gmail.com",
				});

			groupMembers.push(groupMemberResult.body.id);
		}
	});
	describe("POST /:groupId", () => {
		it("should split to all other members", async () => {
			const response = await supertest.post(`/v1/expense/${groupId}`).send({
				name: "Bill",
				amount: 1000,
				payerId: groupMembers[0],
			});
			expect(response).toEqual(
				expect.objectContaining({
					status: 201,
					body: {
						id: expect.any(String),
						name: "Bill",
						amount: "1000",
						groupId: expect.any(String),
						payerId: expect.any(String),
						created: expect.any(String),
						transactions: expect.arrayContaining([
							expect.objectContaining({
								amount: "-1000",
							}),
							expect.objectContaining({
								amount: "334",
							}),
							expect.objectContaining({
								amount: "333",
							}),
							expect.objectContaining({
								amount: "333",
							}),
						]),
					},
				}),
			);
		});
	});
	describe("POST /:groupId/balance", () => {
		it("should return the balance", async () => {
			await supertest.post(`/v1/expense/${groupId}`).send({
				name: "Bill 2",
				amount: 1000,
				payerId: groupMembers[0],
			});
			const response = await supertest.get(`/v1/expense/${groupId}/balance`);
			expect(response.status).toBe(200);
			expect(response.body).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						balance: "-2000",
					}),
					expect.objectContaining({
						balance: "668",
					}),
					expect.objectContaining({
						balance: "666",
					}),
					expect.objectContaining({
						balance: "666",
					}),
				]),
			);
		});
	});
	describe("POST /:groupId/settlement", () => {
		it("should create a settlement", async () => {
			const expenseResult = await supertest
				.post(`/v1/expense/${groupId}`)
				.send({
					name: "Bill 3",
					amount: 1000,
					payerId: groupMembers[0],
				});
			await supertest.post(`/v1/expense/${groupId}/settlement`).send({
				groupId,
				expenseId: expenseResult.body.id,
				senderId: groupMembers[1],
				receiverId: groupMembers[0],
				amount: 500,
			});

			const response = await supertest.get(`/v1/expense/${groupId}/balance`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						balance: "-2500",
					}),
					expect.objectContaining({
						balance: "502",
					}),
					expect.objectContaining({
						balance: "999",
					}),
					expect.objectContaining({
						balance: "999",
					}),
				]),
			);
		});
	});
	describe("POST /:groupId/request-upload", () => {
		it("should request an upload and receive a presigned url", async () => {
			const response = await supertest.get(
				`/v1/expense/${groupId}/request-upload`,
			);
			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				url: expect.any(String),
				message: expect.any(String),
			});
		});
	});
});
