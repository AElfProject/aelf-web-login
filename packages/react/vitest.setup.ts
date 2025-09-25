import { vi, afterEach } from 'vitest';
import '../tools/__mocks__/setupGlobal';
import '../tools/__mocks__/setupLocal';
import { type IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';

// Mock network requests to prevent timeout errors
global.fetch = vi.fn();
global.XMLHttpRequest = vi.fn() as any;

// Mock document.createElement to prevent script loading
if (typeof document !== 'undefined') {
  const originalCreateElement = document.createElement;
  document.createElement = vi.fn().mockImplementation((tagName) => {
    if (tagName === 'script') {
      const mockScript = document.createElement('div') as any; // Create a real DOM element
      mockScript.src = '';
      mockScript.async = false;
      mockScript.onload = null;
      mockScript.onerror = null;
      return mockScript;
    }
    return originalCreateElement.call(document, tagName);
  });
}

vi.mock('@aelf-web-login/wallet-adapter-bridge', () => ({
  initBridge: vi.fn().mockReturnValue({
    getSignIn: vi.fn((children) => children),
    store: {
      getState: () => null,
      subscribe: () => null,
    },
    instance: {
      _wallets: [
        {
          name: 'Portkey',
          icon: 'https://example.com/portkey-icon.png',
        },
        {
          name: 'NightElf',
          icon: 'https://example.com/nightelf-icon.png',
        },
      ],
      theme: 'light',
      connect: vi.fn().mockResolvedValue({ success: true }),
      disConnect: vi.fn().mockResolvedValue({ success: true }),
      lock: vi.fn(),
      getAccountByChainId: vi.fn(),
      getWalletSyncIsCompleted: vi.fn(),
      callSendMethod: vi.fn(),
      callViewMethod: vi.fn(),
      sendMultiTransaction: vi.fn(),
      getSignature: vi.fn(),
      goAssets: vi.fn(),
      activeWallet: {
        disconnectConfirm: false,
      },
    } as any,
  }),
}));

vi.mock('@aelf-web-login/wallet-adapter-portkey-aa', () => ({
  PortkeyAAWallet: vi.fn(),
}));

vi.mock('vconsole', () => ({
  default: vi.fn(),
}));

// Mock rc-motion to prevent animation-related errors
vi.mock('rc-motion', () => ({
  default: vi.fn(({ children }) => children),
  CSSMotion: vi.fn(({ children }) => children),
}));
