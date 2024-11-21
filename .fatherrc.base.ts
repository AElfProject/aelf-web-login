import { defineConfig, type IFatherConfig } from 'father';

const isProd = process.env.NODE_ENV === 'production';
const conf: IFatherConfig = defineConfig({
  cjs: {
    output: 'dist/lib',
    transformer: 'babel',
  },
  esm: {
    output: 'dist/esm',
    transformer: 'babel',
  },
  extraBabelPlugins: [
    ...(isProd
      ? [
          // must declare type here to avoid TS complaint due to father typing being flaky
          [
            'transform-remove-console',
            {
              // remove .log but kept the rest for debugging
              exclude: ['error', 'warn', 'info'],
            },
          ] as NonNullable<IFatherConfig['extraBabelPlugins']>[number],
        ]
      : []),
  ],
});

export default conf;
