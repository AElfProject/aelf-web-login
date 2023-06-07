const esbuild = require('rollup-plugin-esbuild').default;
const litCss = require('rollup-plugin-lit-css').default;
const postcss = require('rollup-plugin-postcss');
const url = require('@rollup/plugin-url').default;
const postcssUrl = require('postcss-url');
const copy = require('rollup-plugin-copy');
const minifyHtml = require('rollup-plugin-minify-html-literals').default;
const terser = require('rollup-plugin-terser').terser;
const path = require('path');

module.exports = function createConfig(packageName) {
  const output = {
    exports: 'named',
    name: packageName,
    sourcemap: true,
  };

  const production = !process.env.ROLLUP_WATCH;

  const esbuildPlugin = esbuild({
    minify: false,
    tsconfig: './tsconfig.json',
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
    extract: path.resolve('dist/assets/index.css'),
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
      input: './index.ts',
      plugins: [litCssPlugin, minifyHtml, esbuildPlugin, postcssPlugin, urlPlugin, copyPlugin],
      output: [
        { file: './dist/index.js', format: 'cjs', ...output },
        { file: './dist/index.mjs', format: 'esm', ...output },
      ],
    },
  ];
}
