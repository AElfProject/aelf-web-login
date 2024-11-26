import { vi } from 'vitest';
import '../tools/__mocks__/setupGlobal';
import '../tools/__mocks__/setupLocal';
import { type IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';

vi.mock('@aelf-web-login/wallet-adapter-bridge', () => ({
  initBridge: vi.fn().mockReturnValue({
    getSignIn: vi.fn((children) => children),
    store: {
      getState: () => null,
      subscribe: () => null,
    },
    instance: {} as IBridgeAPI['instance'],
  }),
}));

vi.mock('@aelf-web-login/wallet-adapter-portkey-aa', () => ({
  PortkeyAAWallet: vi.fn(),
}));

vi.mock('vconsole');

afterEach(() => {
  vi.clearAllMocks();
});
