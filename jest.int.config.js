const defaultConfig = require('./jest.config');

module.exports = {
    ...defaultConfig,
    testMatch: ['**/?(*.)+(int).spec.ts'],
};