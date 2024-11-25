import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      // do nothing
    }
    unobserve() {
      // do nothing
    }
    disconnect() {
      // do nothing
    }
  };
});

afterEach(() => {
  cleanup();
});

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

import { type TChainId } from '@aelf-web-login/wallet-adapter-base';
vi.mock('@aelf-web-login/wallet-adapter-portkey-aa', () => ({
  PortkeyAAWallet: vi.fn(),
}));
vi.mock('@portkey/did-ui-react', () => ({
  getChainInfo: (c: TChainId) => (!c ? null : {}),
  did: {
    didWallet: {
      managementAccount: {
        privateKey: '',
      },
    },
  },
}));
vi.mock('lottie-web');
vi.mock('@portkey/utils');
vi.mock('node-fetch');
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-expect-error TextDecoder
global.TextDecoder = TextDecoder;
