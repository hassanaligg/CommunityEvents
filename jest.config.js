module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/src/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
