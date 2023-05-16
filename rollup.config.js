import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import copy from 'rollup-plugin-copy'
import {glob} from 'glob'
import path from 'path'
import packageJson from './package.json' assert { type: 'json' }

const name = packageJson.main.replace(/\.js$/, '')

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})

const watcher = (globs) => ({
  buildStart() {
    for (const item of globs) {
      glob.sync(path.resolve(item)).forEach((filename) => {
        this.addWatchFile(filename);
      });
    }
  },
});

export default [
  bundle({
    plugins: [
      watcher(['src/**/*.css']),
      esbuild(),
      copy({
        targets: [
          { src: 'src/index.css', dest: 'dist' },
        ]
      })
    ],
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `${name}.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: 'es',
    },
  }),
]