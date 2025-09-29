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
});
