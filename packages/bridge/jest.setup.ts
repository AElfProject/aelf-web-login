// In your own jest-setup.js (or any other name)
import '@testing-library/jest-dom';
jest.mock('@aelf-web-login/wallet-adapter-portkey-aa', () => ({
  PortkeyAAWallet: jest.fn(),
}));
jest.mock('@portkey/did-ui-react', () => ({
  getChainInfo: () => null,
  did: {
    didWallet: {
      managementAccount: {
        privateKey: '',
      },
    },
  },
}));
global.fetch = require('node-fetch');
