/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',

	// A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
	moduleNameMapper: {
		'~/(.*)': '<rootDir>/src/$1',
	},

	// A set of global variables that need to be available in all test environments
	globals: {
		'ts-jest': {
			isolatedModules: true,
		},
	},

	// The glob patterns Jest uses to detect test files
	testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],

	// An array of directory names to be searched recursively up from the requiring module's location
	moduleDirectories: ['node_modules', 'src'],

	// An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
	testPathIgnorePatterns: ['/node_modules/', 'dist'],
};
