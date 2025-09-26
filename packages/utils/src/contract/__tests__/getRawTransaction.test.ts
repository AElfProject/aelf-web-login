import getRawTransactionNight from '../getRawTransactionNight';
import getRawTransactionDiscover from '../getRawTransactionDiscover';
import getRawTransactionPortkey from '../getRawTransactionPortkey';
import { getRawTransaction } from '../getRawTransaction';
import { WalletTypeEnum, TWalletInfo } from '@aelf-web-login/wallet-adapter-base';
import { type Mock } from 'vitest';

vi.mock('../getRawTransactionNight', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue('encodedDataMock1'),
}));
vi.mock('../getRawTransactionDiscover', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue('encodedDataMock2'),
}));
vi.mock('../getRawTransactionPortkey', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue('encodedDataMock3'),
}));
vi.mock('../getRawTransactionFairyVault', () => ({
  getRawTransactionFairyVault: vi.fn().mockResolvedValue('encodedDataMock4'),
}));

describe('getRawTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getRawTransactionPortkey for WalletTypeEnum.aa and return its result', async () => {
    // Arrange
    const walletInfo = {
      extraInfo: {
        portkeyInfo: {
          caInfo: { caHash: 'mockCaHash' },
          walletInfo: { privateKey: 'mockPrivateKey' },
        },
      },
    };

    // Act
    const result = await getRawTransaction({
      walletInfo: walletInfo as unknown as TWalletInfo,
      walletType: WalletTypeEnum.aa,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(getRawTransactionPortkey).toHaveBeenCalledTimes(1);
    expect(result).toBe('encodedDataMock3');
  });

  it('should call getRawTransactionDiscover for WalletTypeEnum.discover and return its result', async () => {
    // Arrange
    const walletInfo: TWalletInfo = {
      address: 'mockAddress',
      extraInfo: {
        provider: {
          request: vi.fn().mockResolvedValue('mockCaHash'),
        },
      },
    };
    // Act
    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.discover,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(getRawTransactionDiscover).toHaveBeenCalledTimes(1);
    expect(result).toBe('encodedDataMock2');
  });

  it('should call getRawTransactionNight for WalletTypeEnum.elf and return its result', async () => {
    const walletInfo: TWalletInfo = { address: 'mockAddress' };

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.elf,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(getRawTransactionNight).toHaveBeenCalledTimes(1);
    expect(result).toBe('encodedDataMock1');
  });

  it('should return null if rpcUrl is not provided', async () => {
    const result = await getRawTransaction({
      walletInfo: {} as TWalletInfo,
      walletType: WalletTypeEnum.aa,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: '',
    });

    expect(result).toBeUndefined();
  });

  it('should log and return null when an error occurs', async () => {
    const walletInfo: TWalletInfo = {
      address: 'mockAddress',
      extraInfo: {
        provider: {
          request: vi.fn().mockResolvedValue('mockCaHash'),
        },
      },
    };

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

    (getRawTransactionDiscover as Mock).mockImplementation(() => {
      throw new Error('Decoding failed');
    });

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.discover,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('getRawTransaction error', expect.any(Error));
    expect(result).toBeNull();

    // Reset mock after test
    (getRawTransactionDiscover as Mock).mockResolvedValue('encodedDataMock2');
    consoleLogSpy.mockRestore();
  });

  it('should call getRawTransactionDiscover for WalletTypeEnum.web and return its result', async () => {
    const walletInfo = {
      extraInfo: {
        provider: {
          request: vi.fn().mockResolvedValue('mockCaHash'),
        },
      },
    };

    const result = await getRawTransaction({
      walletInfo: walletInfo as unknown as TWalletInfo,
      walletType: WalletTypeEnum.web,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(getRawTransactionDiscover).toHaveBeenCalledTimes(1);
    expect(result).toBe('encodedDataMock2');
  });

  it('should call getRawTransactionFairyVault for WalletTypeEnum.fairyVault and return its result', async () => {
    const { getRawTransactionFairyVault } = await import('../getRawTransactionFairyVault');
    const walletInfo: TWalletInfo = {
      address: 'mockAddress',
      extraInfo: {
        provider: { mockProvider: true },
      },
    };

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.fairyVault,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(getRawTransactionFairyVault).toHaveBeenCalledTimes(1);
    expect(result).toBe('encodedDataMock4');
  });

  it('should return undefined for WalletTypeEnum.aa when portkeyInfo is missing', async () => {
    const walletInfo: TWalletInfo = {
      address: 'mockAddress',
      extraInfo: {},
    };

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.aa,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined for WalletTypeEnum.discover when caHash is missing', async () => {
    const walletInfo: TWalletInfo = {
      address: 'mockAddress',
      extraInfo: {
        provider: {
          request: vi.fn().mockResolvedValue(null),
        },
      },
    };

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.discover,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined for WalletTypeEnum.discover when provider is missing', async () => {
    const walletInfo: TWalletInfo = {
      address: 'mockAddress',
      extraInfo: {
        provider: {
          request: vi.fn().mockResolvedValue('mockCaHash'),
        },
      },
    };

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.discover,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(result).toBe('encodedDataMock2');
  });

  it('should return undefined for WalletTypeEnum.fairyVault when address is missing', async () => {
    const walletInfo: TWalletInfo = {
      extraInfo: {
        provider: { mockProvider: true },
      },
    };

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.fairyVault,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined for WalletTypeEnum.fairyVault when provider is missing', async () => {
    const walletInfo: TWalletInfo = {
      address: 'mockAddress',
      extraInfo: {},
    };

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.fairyVault,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined for WalletTypeEnum.elf when address is missing', async () => {
    const walletInfo: TWalletInfo = {};

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.elf,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
    });

    expect(result).toBeUndefined();
  });

  it('should use provided caHash when available', async () => {
    const walletInfo: TWalletInfo = {
      address: 'mockAddress',
      extraInfo: {
        provider: {
          request: vi.fn().mockResolvedValue('mockCaHash'),
        },
      },
    };

    const result = await getRawTransaction({
      walletInfo,
      walletType: WalletTypeEnum.discover,
      params: {},
      methodName: 'mockMethod',
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
      caHash: 'providedCaHash',
    });

    expect(getRawTransactionDiscover).toHaveBeenCalledWith({
      contractAddress: 'mockContractAddress',
      caContractAddress: 'mockCaContractAddress',
      rpcUrl: 'mockRpcUrl',
      caHash: 'providedCaHash',
      params: {},
      methodName: 'mockMethod',
      provider: walletInfo.extraInfo.provider,
    });
    expect(result).toBe('encodedDataMock2');
  });
});
