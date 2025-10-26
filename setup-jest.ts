const testPath = expect.getState().testPath;
const isUnitTest = testPath?.endsWith("unit.spec.ts");

if (isUnitTest) {
	jest.mock("./src/config/knex", () => {
		return {
			transaction: async (cb: any) => cb(),
		};
	});
}
