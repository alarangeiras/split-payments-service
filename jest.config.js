const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	testEnvironment: "node",
	setupFiles: ["dotenv/config"],
	setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
	transform: {
		...tsJestTransformCfg,
	},
};
