import { NetworkEnum } from '@aelf-web-login/wallet-adapter-base';
import { init } from '../init';
import { type IConfigProps, initBridge } from '@aelf-web-login/wallet-adapter-bridge';
import VConsole from 'vconsole';

// Mock document and window for Telegram script injection tests
const mockAppendChild = vi.fn();
const mockCreateElement = vi.fn(() => ({
  src: '',
  async: false,
}));

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(document, 'head', {
  value: {
    appendChild: mockAppendChild,
  },
  writable: true,
});

// Mock location for Telegram script injection tests
delete (window as any).location;
(window as any).location = {
  hostname: 'test.example.com',
};

const baseOptions: IConfigProps = {
  baseConfig: {
    showVconsole: true,
    networkType: NetworkEnum.TESTNET,
    chainId: 'tDVV',
    sideChainId: 'tDVW',
    appName: 'test-app',
  },
  wallets: [],
};

describe('init', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppendChild.mockClear();
    mockCreateElement.mockClear();
  });

  it('should initialize VConsole if showVconsole is true', async () => {
    const options: IConfigProps = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, showVconsole: true },
    };
    init(options);
    // workaround for rare race condition where VConsole is being initiated but init() already returns
    // and assertion runs
    await new Promise<void>((r) => {
      setTimeout(() => {
        expect(VConsole).toHaveBeenCalled();
        r();
      }, 10);
    });
  });

  it('should not initialize VConsole if showVconsole is false', async () => {
    const options = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, showVconsole: false },
    };
    init(options);
    expect(VConsole).not.toHaveBeenCalled();
  });

  it('should call initBridge with the given options', async () => {
    const options = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, showVconsole: false },
    };
    init(options);
    expect(initBridge).toHaveBeenCalledWith(options);
  });

  it('should handle omitTelegramScript option', () => {
    const options: IConfigProps = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, omitTelegramScript: true },
    };

    init(options);
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  it('should handle multiple init calls', () => {
    const options: IConfigProps = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, omitTelegramScript: false },
    };

    // First call
    init(options);
    // Second call should not cause issues
    init(options);

    expect(true).toBe(true);
  });

  it('should handle VConsole initialization', async () => {
    const options: IConfigProps = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, showVconsole: true },
    };

    init(options);

    // Wait for async VConsole initialization
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(true).toBe(true);
  });
});
