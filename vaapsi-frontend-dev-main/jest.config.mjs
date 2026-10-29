import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

/**
 * Jest configuration.
 *
 * **`.mjs`, not `.ts`, and that matters.** Jest loads a TypeScript config by
 * handing it to `ts-node`, which is not a dependency of this project — so
 * `pnpm test` failed on Node 20 with "'ts-node' is required for the TypeScript
 * configuration files". It passed on Node 22.6+ only because those versions
 * strip types natively, which made the breakage invisible to anyone on a newer
 * Node than the one this project pins in `.nvmrc` and runs in CI.
 *
 * Plain ESM with a JSDoc `@type` keeps the editor completion and the type
 * checking without the dependency, and it matches `next.config.mjs`,
 * `postcss.config.mjs` and `lint-staged.config.mjs` — this file was the only
 * config here that was not already `.mjs`.
 *
 * @type {import('jest').Config}
 */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
}

export default createJestConfig(config)
