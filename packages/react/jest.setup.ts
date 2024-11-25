// In your own jest-setup.js (or any other name)
import '@testing-library/jest-dom';
global.fetch = require('node-fetch');
import { type IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';

jest.mock('@aelf-web-login/wallet-adapter-bridge', () => ({
  initBridge: jest.fn().mockReturnValue({
    getSignIn: jest.fn((children) => children),
    store: {
      getState: () => null,
      subscribe: () => null,
    },
    instance: {} as IBridgeAPI['instance'],
    mountApp: () => null,
    unMountApp: () => null,
  }),
}));

jest.mock('@aelf-web-login/wallet-adapter-portkey-aa', () => ({
  PortkeyAAWallet: jest.fn(),
}));

jest.mock('vconsole');
