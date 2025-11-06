const defaultConfig = require('./jest.config');

module.exports = {
    ...defaultConfig,
    testMatch: ['**/?(*.)+(unit).spec.ts'],
};