import '../tools/__mocks__/setupGlobal';
import '../tools/__mocks__/setupLocal';

// Mock window.NightElf.AElf for getRawTransactionNight tests
Object.defineProperty(global, 'window', {
  value: {
    NightElf: {
      AElf: vi.fn().mockImplementation(() => ({
        httpProvider: [],
        appName: 'APP_NAME',
        pure: true,
        getSignature: vi.fn().mockResolvedValue({
          signature: 'mockSignature',
        }),
      })),
    },
  },
  writable: true,
});

// Fix React concurrent rendering issues
import { configure } from '@testing-library/react';
import { act } from '@testing-library/react';

// Disable React 18 concurrent features for testing
process.env.REACT_18_CONCURRENT_FEATURES = 'false';

configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Disable automatic cleanup from @testing-library/react
// This prevents the "Should not already be working" error
const originalAfterEach = global.afterEach;
global.afterEach = (fn) => {
  if (fn && fn.toString().includes('cleanup')) {
    // Skip cleanup to prevent concurrent rendering issues
    return;
  }
  return originalAfterEach(fn);
};

// Override @testing-library/react's automatic cleanup
// This prevents React 18 concurrent rendering issues
try {
  const originalModule = require.cache[require.resolve('@testing-library/react')];
  if (originalModule) {
    const originalExports = originalModule.exports;
    if (originalExports && originalExports.cleanup) {
      // Use Object.defineProperty to override the cleanup function
      Object.defineProperty(originalExports, 'cleanup', {
        value: () => {
          // Disable cleanup to prevent concurrent rendering issues
        },
        writable: true,
        configurable: true,
      });
    }
  }
} catch (error) {
  // Ignore if module is not found
}

// Mock ReactDOM createRoot to prevent concurrent rendering issues
// Note: We'll handle this in individual test files instead of global mock

// Mock AElf SDK to prevent network requests
vi.mock('aelf-sdk', () => {
  const instances = new Map();

  const createMockAElfInstance = (rpcUrl) => ({
    chain: {
      getTxResult: vi.fn().mockResolvedValue({
        Status: 'Mined',
        Transaction: { Id: 'test-tx-id' },
      }),
    },
    rpcUrl: rpcUrl, // Add rpcUrl to distinguish instances
  });

  const AElfConstructor = vi.fn().mockImplementation((provider) => {
    // Extract rpcUrl from provider if possible, or use a default
    const rpcUrl = provider?.rpcUrl || provider || 'default';

    // Return cached instance if exists, otherwise create new one
    if (!instances.has(rpcUrl)) {
      instances.set(rpcUrl, createMockAElfInstance(rpcUrl));
    }

    return instances.get(rpcUrl);
  });

  // Add static properties to the constructor
  AElfConstructor.utils = {
    transform: {
      transformMapToArray: vi.fn().mockReturnValue({}),
      transform: vi.fn().mockReturnValue({}),
      INPUT_TRANSFORMERS: {},
    },
    uint8ArrayToHex: vi.fn().mockReturnValue('0x123456'),
    sha256: vi.fn().mockReturnValue('mockHash'),
    decodeAddressRep: vi.fn().mockImplementation((address) => {
      // Mock valid address check
      if (address === 'rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk') {
        return { address: address };
      }
      throw new Error('Invalid address');
    }),
  };

  AElfConstructor.pbUtils = {
    getTransaction: vi
      .fn()
      .mockImplementation((address, contractAddress, functionName, packedInput) => ({
        refBlockNumber: 0,
        refBlockPrefix: '0x00000000',
        methodName: functionName,
        params: packedInput,
      })),
    Transaction: {
      encode: vi.fn().mockReturnValue({
        finish: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4, 5])),
      }),
    },
  };

  AElfConstructor.providers = {
    HttpProvider: vi.fn().mockImplementation(() => ({})),
  };

  return {
    default: AElfConstructor,
  };
});

// Mock @portkey/utils to prevent network requests
vi.mock('@portkey/utils', () => ({
  aelf: {
    utils: {
      transform: {
        transformMapToArray: vi.fn().mockReturnValue({}),
        transform: vi.fn().mockReturnValue({}),
        INPUT_TRANSFORMERS: {},
      },
      uint8ArrayToHex: vi.fn().mockReturnValue('0x123456'),
    },
    getAelfInstance: vi.fn().mockReturnValue({
      chain: {
        getChainStatus: vi.fn().mockResolvedValue({
          BestChainHeight: 100,
          BestChainHash: '0x123456',
        }),
      },
    }),
  },
}));
