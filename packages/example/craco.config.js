/* eslint-disable */
const path = require("path");
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, arg) => {
      return webpackConfig;
    },

    plugins: {
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'https://did-portkey-test.portkey.finance',
        changeOrigin: true,
        secure: true,
      },
      '/connect': {
        target: "https://auth-portkey-test.portkey.finance",
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
