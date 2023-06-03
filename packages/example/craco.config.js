/* eslint-disable */
const path = require("path");
const webpack = require('webpack');
const { getLoader, loaderByName } = require("@craco/craco");

const packages = [];
packages.push(path.join(__dirname, "../login"));

module.exports = {
  webpack: {
    configure: (webpackConfig, arg) => {
      // const { isFound, match } = getLoader(webpackConfig, loaderByName("babel-loader"));
      // if (isFound) {
      //   const include = Array.isArray(match.loader.include)
      //     ? match.loader.include
      //     : [match.loader.include];

      //   match.loader.include = include.concat(packages);
      // }

      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        buffer: path.resolve(__dirname, '../../node_modules/buffer'),
      };
      console.log(webpackConfig.resolve);
      // throw new Error();
      return webpackConfig;
    },

    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'https://did-portkey-test.portkey.finance',
        changeOrigin: true,
        secure: true,
      },
      '/AElfIndexer_DApp/PortKeyIndexerCASchema': {
        // source: '/AElfIndexer_DApp/:path*',
        // target: 'http://192.168.67.172:8083', // test1
        target: 'https://dapp-portkey-test.portkey.finance',
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          '^/AElfIndexer_DApp/PortKeyIndexerCASchema': '/Portkey_DID/PortKeyIndexerCASchema'
        },
      }
    },
  },
};
