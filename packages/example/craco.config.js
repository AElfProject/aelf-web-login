/* eslint-disable */
const path = require("path");
const { ProvidePlugin } = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, arg) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "events": require.resolve("events/"),
        "buffer": require.resolve("buffer/")
      }
      return webpackConfig;
    },
    plugins: {
      new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
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
