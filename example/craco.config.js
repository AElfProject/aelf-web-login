/* eslint-disable */
const path = require('path');
const {CracoAliasPlugin} = require('react-app-alias-ex')

module.exports = {
  webpack: {
    alias: {
      'aelf-web-login/dist/index.css': path.resolve(__dirname, '../dist/index.css'),
    }
  },
  plugins: [{
    plugin: CracoAliasPlugin,
    options: {},
  }],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.67.51:5577',
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