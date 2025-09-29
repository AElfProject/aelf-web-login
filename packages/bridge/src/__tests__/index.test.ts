import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initBridge } from '../index';
import { Bridge } from '../bridge';
import { store } from '../store';
import { NetworkEnum, SignInDesignEnum, TChainId } from '@aelf-web-login/wallet-adapter-base';
import { ThemeType } from '@portkey/connect-web-wallet';

// Mock Bridge class
vi.mock('../bridge', () => ({
  Bridge: vi.fn().mockImplementation(() => ({
    _wallets: [],
    _sideChainId: 'tDVV',
    theme: 'dark',
    _activeWallet: undefined,
  })),
}));

// Mock store
vi.mock('../store', () => ({
  store: {
    dispatch: vi.fn(),
    getState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('initBridge', () => {
  const mockWallets = [
    {
      name: 'Portkey Web Wallet',
      icon: 'icon1',
      loginState: 'unlocked',
      wallet: {},
      loginEagerly: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      signTransaction: vi.fn(),
      sendTransaction: vi.fn(),
      goAssets: vi.fn(),
    },
    {
      name: 'Portkey Discover',
      icon: 'icon2',
      loginState: 'unlocked',
      wallet: {},
      loginEagerly: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      signTransaction: vi.fn(),
      sendTransaction: vi.fn(),
      goAssets: vi.fn(),
    },
  ] as any;

  const mockBaseConfig = {
    networkType: NetworkEnum.MAINNET,
    appName: 'Test App',
    chainId: 'AELF' as TChainId,
    sideChainId: 'tDVV' as TChainId,
    design: SignInDesignEnum.CryptoDesign,
    theme: 'dark' as ThemeType,
    showVconsole: false,
    omitTelegramScript: false,
    enableAcceleration: true,
  };

  const mockConfig = {
    baseConfig: mockBaseConfig,
    wallets: mockWallets,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize bridge with correct configuration', () => {
    const result = initBridge(mockConfig);

    expect(Bridge).toHaveBeenCalledWith(mockWallets, mockBaseConfig);
    expect(result).toEqual({
      instance: expect.any(Object),
      store: store,
    });
  });

  it('should initialize bridge with minimal configuration', () => {
    const minimalConfig = {
      baseConfig: {
        networkType: NetworkEnum.MAINNET,
        appName: 'Test App',
        chainId: 'AELF' as TChainId,
        sideChainId: 'tDVV' as TChainId,
      },
      wallets: mockWallets,
    };

    const result = initBridge(minimalConfig);

    expect(Bridge).toHaveBeenCalledWith(mockWallets, minimalConfig.baseConfig);
    expect(result).toEqual({
      instance: expect.any(Object),
      store: store,
    });
  });

  it('should initialize bridge with all optional parameters', () => {
    const fullConfig = {
      baseConfig: {
        ...mockBaseConfig,
        loginConfig: {
          loginMethods: ['Email', 'Phone'],
        } as any,
        showVconsole: true,
        omitTelegramScript: true,
        enableAcceleration: false,
      },
      wallets: mockWallets,
    };

    const result = initBridge(fullConfig);

    expect(Bridge).toHaveBeenCalledWith(mockWallets, fullConfig.baseConfig);
    expect(result).toEqual({
      instance: expect.any(Object),
      store: store,
    });
  });

  it('should handle empty wallets array', () => {
    const configWithEmptyWallets = {
      baseConfig: mockBaseConfig,
      wallets: [],
    };

    const result = initBridge(configWithEmptyWallets);

    expect(Bridge).toHaveBeenCalledWith([], mockBaseConfig);
    expect(result).toEqual({
      instance: expect.any(Object),
      store: store,
    });
  });

  it('should handle different network types', () => {
    const testnetConfig = {
      baseConfig: {
        ...mockBaseConfig,
        networkType: NetworkEnum.TESTNET,
      },
      wallets: mockWallets,
    };

    const result = initBridge(testnetConfig);

    expect(Bridge).toHaveBeenCalledWith(mockWallets, testnetConfig.baseConfig);
    expect(result).toEqual({
      instance: expect.any(Object),
      store: store,
    });
  });

  it('should handle different themes', () => {
    const lightThemeConfig = {
      baseConfig: {
        ...mockBaseConfig,
        theme: 'light' as ThemeType,
      },
      wallets: mockWallets,
    };

    const result = initBridge(lightThemeConfig);

    expect(Bridge).toHaveBeenCalledWith(mockWallets, lightThemeConfig.baseConfig);
    expect(result).toEqual({
      instance: expect.any(Object),
      store: store,
    });
  });

  it('should handle different sign-in designs', () => {
    const popupDesignConfig = {
      baseConfig: {
        ...mockBaseConfig,
        design: SignInDesignEnum.Web2Design,
      },
      wallets: mockWallets,
    };

    const result = initBridge(popupDesignConfig);

    expect(Bridge).toHaveBeenCalledWith(mockWallets, popupDesignConfig.baseConfig);
    expect(result).toEqual({
      instance: expect.any(Object),
      store: store,
    });
  });

  it('should return correct interface structure', () => {
    const result = initBridge(mockConfig);

    expect(result).toHaveProperty('instance');
    expect(result).toHaveProperty('store');
    expect(typeof result.instance).toBe('object');
    expect(result.store).toBe(store);
  });

  it('should handle console.log call', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    initBridge(mockConfig);

    expect(consoleSpy).toHaveBeenCalledWith('init bridge');

    consoleSpy.mockRestore();
  });
});
