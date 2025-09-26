import getRawTransactionNight, { CreateTransactionParamsOfNight } from '../getRawTransactionNight';
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
    utils: {
      transform: {
        transformMapToArray: vi.fn().mockReturnValue({}),
        transform: vi.fn().mockReturnValue({}),
        INPUT_TRANSFORMERS: {},
      },
      uint8ArrayToHex: vi.fn().mockReturnValue('0x123456'),
    },
  },
}));

// Mock @portkey/contracts
vi.mock('@portkey/contracts', () => ({
  getContractMethods: vi.fn().mockResolvedValue({
    exampleMethod: {
      fromObject: vi.fn().mockReturnValue({}),
      encode: vi.fn().mockReturnValue({
        finish: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
      }),
    },
  }),
}));

describe('getRawTransactionNight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return encoded transaction data', async () => {
    const params: CreateTransactionParamsOfNight = {
      contractAddress: '0xExampleAddress',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
      rpcUrl: 'https://example-rpc-url.com',
      account: { address: '0xExampleAccount' },
    };

    const result = await getRawTransactionNight(params);
    expect(result).toBe('0x123456');
  });

  it('should handle errors from aelf.getAelfInstance', async () => {
    const { aelf } = await import('@portkey/utils');
    (aelf.getAelfInstance as Mock).mockRejectedValue(new Error('Failed to get instance'));

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle errors from handleTransactionParams', async () => {
    const { getContractMethods } = await import('@portkey/contracts');
    (getContractMethods as Mock).mockImplementation(() => {
      throw new Error('Failed to handle params');
    });

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle errors from chain.getChainStatus', async () => {
    const { aelf } = await import('@portkey/utils');
    (aelf.getAelfInstance as Mock).mockReturnValue({
      chain: {
        getChainStatus: vi.fn().mockRejectedValue(new Error('Failed to get chain status')),
      },
    });

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle errors from handleTransaction', async () => {
    const { aelf } = await import('@portkey/utils');
    (aelf.getAelfInstance as Mock).mockReturnValue({
      chain: {
        getChainStatus: vi.fn().mockResolvedValue({
          BestChainHeight: 100,
          BestChainHash: '0x123456',
        }),
      },
    });

    // Mock window.NightElf to throw error
    (global as any).window = {
      NightElf: {
        AElf: vi.fn().mockImplementation(() => {
          throw new Error('Failed to handle transaction');
        }),
      },
    };

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle errors from getContractMethods', async () => {
    const { getContractMethods } = await import('@portkey/contracts');
    (getContractMethods as Mock).mockRejectedValue(new Error('Failed to get contract methods'));

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle errors from AElf.utils.transform', async () => {
    const AElf = await import('aelf-sdk');
    (AElf.default.utils.transform.transform as Mock).mockImplementation(() => {
      throw new Error('Transform failed');
    });

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle errors from protoInputType.fromObject', async () => {
    const { getContractMethods } = await import('@portkey/contracts');
    const mockProtoInputType = {
      fromObject: vi.fn().mockImplementation(() => {
        throw new Error('fromObject failed');
      }),
      encode: vi.fn().mockReturnValue({
        finish: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
      }),
    };
    (getContractMethods as Mock).mockResolvedValue({
      anyMethod: mockProtoInputType,
    });

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle errors from protoInputType.encode', async () => {
    const { getContractMethods } = await import('@portkey/contracts');
    const mockProtoInputType = {
      fromObject: vi.fn().mockReturnValue({}),
      encode: vi.fn().mockImplementation(() => {
        throw new Error('encode failed');
      }),
    };
    (getContractMethods as Mock).mockResolvedValue({
      anyMethod: mockProtoInputType,
    });

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle getSignature error with errorMessage', async () => {
    // Reset all mocks first
    vi.clearAllMocks();

    // Mock window.NightElf to simulate getSignature error
    (global as any).window = {
      NightElf: {
        AElf: vi.fn().mockImplementation(() => ({
          getSignature: vi.fn().mockResolvedValue({
            errorMessage: 'Signature failed',
            signature: null,
          }),
        })),
      },
    };

    // Mock the contract methods to avoid encode error
    const { getContractMethods } = await import('@portkey/contracts');
    (getContractMethods as Mock).mockResolvedValue({
      anyMethod: {
        fromObject: vi.fn().mockReturnValue({}),
        encode: vi.fn().mockReturnValue({
          finish: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
        }),
      },
    });

    // Reset the transform mock to avoid interference
    const AElf = await import('aelf-sdk');
    (AElf.default.utils.transform.transform as Mock).mockReturnValue({});

    // Reset the encode mock
    (AElf.default.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    });

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBe('Signature failed');
    }
  });

  it('should handle getSignature catch error', async () => {
    // Mock window.NightElf to simulate getSignature throwing error
    (global as any).window = {
      NightElf: {
        AElf: vi.fn().mockImplementation(() => ({
          getSignature: vi.fn().mockRejectedValue(new Error('Signature error')),
        })),
      },
    };

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle handleTransaction catch error', async () => {
    // Mock window.NightElf to simulate handleTransaction error
    (global as any).window = {
      NightElf: {
        AElf: vi.fn().mockImplementation(() => ({
          getSignature: vi.fn().mockResolvedValue({
            signature: 'mockSignature',
          }),
        })),
      },
    };

    // Mock AElf.pbUtils to throw error
    const AElf = await import('aelf-sdk');
    (AElf.default.pbUtils.Transaction.encode as Mock).mockImplementation(() => {
      throw new Error('Transaction encode failed');
    });

    try {
      await getRawTransactionNight({
        contractAddress: 'anyAddress',
        params: {},
        methodName: 'anyMethod',
        rpcUrl: 'anyRpcUrl',
        account: { address: 'anyAccount' },
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle tx not instanceof Buffer in handleTransaction', async () => {
    // Reset all mocks first
    vi.clearAllMocks();

    // Mock window.NightElf
    (global as any).window = {
      NightElf: {
        AElf: vi.fn().mockImplementation(() => ({
          getSignature: vi.fn().mockResolvedValue({
            signature: 'mockSignature',
          }),
        })),
      },
    };

    // Mock the contract methods to avoid encode error
    const { getContractMethods } = await import('@portkey/contracts');
    (getContractMethods as Mock).mockResolvedValue({
      anyMethod: {
        fromObject: vi.fn().mockReturnValue({}),
        encode: vi.fn().mockReturnValue({
          finish: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
        }),
      },
    });

    // Reset the transform mock to avoid interference
    const AElf = await import('aelf-sdk');
    (AElf.default.utils.transform.transform as Mock).mockReturnValue({});

    // Mock AElf.pbUtils to return non-Buffer
    (AElf.default.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue('not-a-buffer'),
    });

    const result = await getRawTransactionNight({
      contractAddress: 'anyAddress',
      params: {},
      methodName: 'anyMethod',
      rpcUrl: 'anyRpcUrl',
      account: { address: 'anyAccount' },
    });

    expect(result).toBeDefined();
  });
});
