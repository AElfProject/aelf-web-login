import { defineConfig, configDefaults } from 'vitest/config';

const exclude = [...configDefaults.exclude, '**/dist/*.*', '**/.*', '**/*.setup.*'];

export default defineConfig({
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
          include: ['node-fetch'],
        },
      },
    },
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['./src/**/*(*.)?{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'bridge',
    exclude,
    reporters: ['junit'],
    outputFile: {
      junit: './jest-report.xml',
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      exclude: [...exclude, '**/__tests__/*.*'],
      reportsDirectory: './coverage',
      reporter: [['json', { file: 'coverage-summary.json' }]],
    },
  },
});
