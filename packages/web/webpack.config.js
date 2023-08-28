const path = require('path');
const merge = require('webpack-merge');

module.exports = merge({
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      name: 'AElfWebLogin',
      type: 'umd',
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx', '...'],
    alias: {
      react: path.resolve('./node_modules/react'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.(css|less)$/,
        use: ['css-loader', 'less-loader'],
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      }
    ],
  },

  plugins: [],
});
