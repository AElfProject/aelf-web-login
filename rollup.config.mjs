import esbuild from 'rollup-plugin-esbuild';
import litCss from 'rollup-plugin-lit-css';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import postcssUrl from 'postcss-url';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import minifyHtml from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

import path from 'path';

export default function createConfig(packageName, tsconfig = './tsconfig.json') {
  const output = {
    exports: 'named',
    name: packageName,
    sourcemap: true,
  };

  const production = !process.env.ROLLUP_WATCH;

  const esbuildPlugin = esbuild({
    exclude: '/node_modules/**',
    minify: false,
    tsconfig,
    platform: 'browser',
    treeShaking: true,
    loaders: {
      '.json': 'json',
    },
  });

  const litCssPlugin = litCss({
    include: ['**/*.css'],
    uglify: true,
  });

  const copyPlugin = copy({
    targets: [
      // Need to copy the files over for usage
      { src: 'src/assets/fonts', dest: 'dist/assets' },
      // { src: 'src/sandbox', dest: 'dist' },
    ],
  });

  const postcssPlugin = postcss({
    minimize: true,
    modules: false,
    autoModules: true,
    extensions: ['.css', '.less'],
    use: {
      sass: null,
      stylus: null,
    },
    // extract: path.resolve('dist/assets/index.css'),
    plugins: [
      postcssUrl({
        url: 'inline', // enable inline assets using base64 encoding
        maxSize: 10, // maximum file size to inline (in kilobytes)
        fallback: 'copy', // fallback method to use if max size is exceeded
      }),
    ],
  });

  const urlPlugin = url();

  const terserPlugin =
    production &&
    terser({
      compress: {
        drop_console: production,
        drop_debugger: production,
      },
      output: { comments: false },
    });

  return [
    {
      input: './src/index.ts',
      plugins: [
        minifyHtml,
        esbuildPlugin,
        nodeResolve({ esmExternals: true, requireReturnsDefault: 'namespace', browser: true, preserveSymlinks: true }),
        // nodeResolve({ preferBuiltins: false, preserveSymlinks: true, browser: true }),
        commonjs({
          include: /node_modules/,
          // transformMixedEsModules: true,
          // defaultIsModuleExports: false,
        }),
        babel({
          exclude: /node_modules/,
          presets: ['@babel/preset-react'],
          babelHelpers: 'bundled',
        }),
        postcssPlugin,
        litCssPlugin,
        urlPlugin,
        copyPlugin,
      ],
      output: [{ file: './dist/umd/index.js', format: 'umd', ...output }],
      // external: [
      //   'aelf-sdk',
      //   'crypto-js/aes.js',
      //   'crypto-js/enc-utf8.js',
      //   'query-string',
      //   'react',
      //   'react-is',
      //   'react-dom',
      //   'lodash/camelCase',
      //   'classnames',
      //   'moment',
      //   'lodash/padStart',
      //   'lodash/debounce',
      //   'json2mq',
      //   'shallowequal',
      //   'lodash/padEnd',
      //   'lodash/isEqual',
      //   'copy-to-clipboard',
      //   'fast-deep-equal/react',
      //   'js-cookie',
      // ],
    },
  ];
}
