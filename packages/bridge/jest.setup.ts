import { type TChainId } from '@aelf-web-login/wallet-adapter-base';
import '@testing-library/jest-dom';
jest.mock('@aelf-web-login/wallet-adapter-portkey-aa', () => ({
  PortkeyAAWallet: jest.fn(),
}));
jest.mock('@portkey/did-ui-react', () => ({
  getChainInfo: (c: TChainId) => (!c ? null : {}),
  did: {
    didWallet: {
      managementAccount: {
        privateKey: '',
      },
    },
  },
}));
jest.mock('lottie-web');
jest.mock('@portkey/utils');
import 'jest-canvas-mock';
global.fetch = require('node-fetch');
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-expect-error TextDecoder
global.TextDecoder = TextDecoder;
