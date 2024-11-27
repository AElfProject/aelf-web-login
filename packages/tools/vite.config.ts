/// <reference types="vitest" />
import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const exclude = [...configDefaults.exclude, '**/dist/*.*', '**/.*', '**/*.setup.*'];

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    maxConcurrency: 20,
    pool: 'vmThreads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    isolate: false, // only safe with the poolOptions above
    css: false,
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: [],
        },
      },
    },
    globals: true,
    watch: false,
    environment: 'happy-dom',
    // expect a relative vitest.setup.[js|ts] file where this is initiated
    // due to nature of mocks being hoisted during evaluation, consumers need
    // to provide individual vitest setup files
    setupFiles: ['./vitest.setup'],
    include: ['./src/**/*(*.)?{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'bridge',
    exclude,
    reporters: ['junit', 'default'],
    outputFile: {
      junit: './jest-report.xml',
    },
    coverage: {
      all: false,
      enabled: true,
      provider: 'v8',
      exclude: [...exclude, '**/__tests__/*.*'],
      reportsDirectory: './coverage',
      reporter: [
        ['json-summary', { file: 'coverage-summary.json' }],
        ['lcov', { file: 'lcov.info' }],
        ['text'],
      ],
    },
  },
});
