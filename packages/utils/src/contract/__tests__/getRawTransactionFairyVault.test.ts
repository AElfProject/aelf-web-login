import { getRawTransactionFairyVault } from '../getRawTransactionFairyVault';
import { type Mock } from 'vitest';

// Mock @portkey/utils
vi.mock('@portkey/utils', () => ({
  aelf: {
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

// Mock aelf-sdk
vi.mock('aelf-sdk', () => ({
  default: {
    utils: {
      uint8ArrayToHex: vi.fn().mockReturnValue('0x123456'),
    },
  },
}));

// Mock getRawTransactionNight
vi.mock('../getRawTransactionNight', () => ({
  handleTransactionParams: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

// Mock getRawTransactionDiscover
vi.mock('../getRawTransactionDiscover', () => ({
  getAElf: vi.fn().mockReturnValue({
    chain: {
      getChainStatus: vi.fn().mockResolvedValue({
        BestChainHeight: 100,
        BestChainHash: '0x123456',
      }),
    },
  }),
  handleTransaction: vi.fn().mockResolvedValue('encodedTransaction'),
}));

describe('getRawTransactionFairyVault', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return encoded transaction when successful', async () => {
    const params = {
      account: { address: '0xExampleAddress' },
      contractAddress: '0xContractAddress',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
      rpcUrl: 'https://example-rpc-url.com',
      provider: { mockProvider: true },
    };

    const result = await getRawTransactionFairyVault(params);
    expect(result).toBe('encodedTransaction');
  });

  it('should return null when error occurs', async () => {
    const { aelf } = await import('@portkey/utils');
    (aelf.getAelfInstance as Mock).mockImplementation(() => {
      throw new Error('Failed to get instance');
    });

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

    const params = {
      account: { address: '0xExampleAddress' },
      contractAddress: '0xContractAddress',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
      rpcUrl: 'https://example-rpc-url.com',
      provider: { mockProvider: true },
    };

    const result = await getRawTransactionFairyVault(params);

    expect(result).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error), 'error===');

    consoleLogSpy.mockRestore();
  });

  it('should handle handleTransactionParams error', async () => {
    const { handleTransactionParams } = await import('../getRawTransactionNight');
    (handleTransactionParams as Mock).mockRejectedValue(new Error('Failed to handle params'));

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

    const params = {
      account: { address: '0xExampleAddress' },
      contractAddress: '0xContractAddress',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
      rpcUrl: 'https://example-rpc-url.com',
      provider: { mockProvider: true },
    };

    const result = await getRawTransactionFairyVault(params);

    expect(result).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error), 'error===');

    consoleLogSpy.mockRestore();
  });

  it('should handle getAElf error', async () => {
    const { getAElf } = await import('../getRawTransactionDiscover');
    (getAElf as Mock).mockRejectedValue(new Error('Failed to get AElf'));

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

    const params = {
      account: { address: '0xExampleAddress' },
      contractAddress: '0xContractAddress',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
      rpcUrl: 'https://example-rpc-url.com',
      provider: { mockProvider: true },
    };

    const result = await getRawTransactionFairyVault(params);

    expect(result).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error), 'error===');

    consoleLogSpy.mockRestore();
  });

  it('should handle handleTransaction error', async () => {
    const { handleTransaction } = await import('../getRawTransactionDiscover');
    (handleTransaction as Mock).mockRejectedValue(new Error('Failed to handle transaction'));

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

    const params = {
      account: { address: '0xExampleAddress' },
      contractAddress: '0xContractAddress',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
      rpcUrl: 'https://example-rpc-url.com',
      provider: { mockProvider: true },
    };

    const result = await getRawTransactionFairyVault(params);

    expect(result).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error), 'error===');

    consoleLogSpy.mockRestore();
  });
});
