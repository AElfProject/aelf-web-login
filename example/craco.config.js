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
    },
  },
};