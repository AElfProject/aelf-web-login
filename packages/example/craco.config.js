/* eslint-disable */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, arg) => {
      webpackConfig.module.rules = [
        ...webpackConfig.module.rules,
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
      ];
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        events: require.resolve('events/'),
        buffer: require.resolve('buffer/'),
        "process": require.resolve("process/browser"),
      };
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ];
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
    https: {
      key: './ssl/server.key', 
      cert: './ssl/server.cert', 
    },
    proxy: {
      '/v1/api': {
        target: 'https://did-portkey-test.portkey.finance',
        changeOrigin: true,
        pathRewrite: { '^/v1': '' },
        secure: true,
      },
      '/v2/api': {
        target: 'https://aa-portkey-test.portkey.finance',
        changeOrigin: true,
        pathRewrite: { '^/v2': '' },
        secure: true,
      },
      '/connect': {
        target: 'https://auth-portkey-test.portkey.finance',
        changeOrigin: true,
        secure: true,
      },
      '/AElfIndexer_DApp/PortKeyIndexerCASchema': {
        // source: '/AElfIndexer_DApp/:path*',
        // target: 'http://192.168.67.172:8083',
        target: 'https://dapp-portkey-test.portkey.finance',
        changeOrigin: true,
        secure: true,
      },
    },
  },
};
