import { getAElf, getTxResultRetry } from '../getTxResultRetry';
import { getTxResult } from '@portkey/contracts';

jest.mock('@portkey/contracts', () => ({
  getTxResult: jest.fn(),
}));

describe('test getAElf', () => {
  beforeEach(() => {
    const mockConstructor = jest.fn((param1) => {
      return {
        param1,
      };
    });

    const mockProviders = jest.fn().mockImplementation(() => {
      return {
        HttpProvider: jest.fn().mockReturnValueOnce({}),
      };
    });
    jest.doMock('aelf-sdk', () => ({
      __esModule: true,
      default: mockConstructor,
      providers: mockProviders,
    }));
  });

  it('should create and cache a new AElf instance for a new RPC URL', async () => {
    const rpcUrl = 'https://example-rpc.com';

    const aelfInstance1 = getAElf(rpcUrl);
    const aelfInstance2 = getAElf(rpcUrl);
    expect(JSON.stringify(aelfInstance1)).toBe(JSON.stringify(aelfInstance2));
  });

  it('should return the cached AElf instance for the same RPC URL', async () => {
    const rpcUrl1 = 'https://example-rpc1.com';
    const rpcUrl2 = 'https://example-rpc2.com';

    const aelfInstance1 = getAElf(rpcUrl1);
    const aelfInstance2 = getAElf(rpcUrl1);
    const aelfInstance3 = getAElf(rpcUrl2);

    expect(JSON.stringify(aelfInstance1)).toBe(JSON.stringify(aelfInstance2));
    expect(JSON.stringify(aelfInstance1)).not.toBe(JSON.stringify(aelfInstance3));
  });
});

describe('test getTxResultRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mined transaction result', async () => {
    const mockTxResult = {
      Status: 'MINED',
    };

    (getTxResult as jest.Mock).mockResolvedValue(mockTxResult);

    const TransactionId = 'some-transaction-id';
    const rpcUrl = 'https://example-rpc.com';

    const result = await getTxResultRetry(TransactionId, rpcUrl);
    expect(result).toEqual(mockTxResult);
    expect(getTxResult).toHaveBeenCalledTimes(1);
  });

  it('throws an error when transaction status is not mined', async () => {
    const mockTxResult = {
      Status: 'FAILED',
    };
    (getTxResult as jest.Mock).mockResolvedValue(mockTxResult);

    const TransactionId = 'another-transaction-id';
    const rpcUrl = 'https://example-rpc.com';

    await expect(getTxResultRetry(TransactionId, rpcUrl)).rejects.toThrow('Transaction error');
    expect(getTxResult).toHaveBeenCalledTimes(1);
  });
});
