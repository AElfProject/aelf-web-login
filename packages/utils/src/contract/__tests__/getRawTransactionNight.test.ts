import { getContractBasic } from '@portkey/contracts';
import getRawTransactionNight, { CreateTransactionParamsOfNight } from '../getRawTransactionNight';
import { type Mock } from 'vitest';

vi.mock('@portkey/contracts', () => ({
  getContractBasic: vi.fn(),
}));

describe('getRawTransactionNight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return encoded transaction data', async () => {
    const mockContract = {
      encodedTx: vi.fn().mockResolvedValue({ data: 'encodedDataMock' }),
    };
    (getContractBasic as Mock).mockResolvedValue(mockContract);

    const params: CreateTransactionParamsOfNight = {
      contractAddress: '0xExampleAddress',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
      rpcUrl: 'https://example-rpc-url.com',
      account: { address: '0xExampleAccount' },
    };

    const result = await getRawTransactionNight(params);
    expect(result).toBe('encodedDataMock');

    expect(getContractBasic).toHaveBeenCalledTimes(1);
    expect(getContractBasic).toHaveBeenCalledWith({
      account: { address: '0xExampleAccount' },
      contractAddress: '0xExampleAddress',
      rpcUrl: 'https://example-rpc-url.com',
    });

    expect(mockContract.encodedTx).toHaveBeenCalledTimes(1);
    expect(mockContract.encodedTx).toHaveBeenCalledWith('exampleMethod', { exampleParam: 'value' });
  });

  it('should handle errors from getContractBasic', async () => {
    (getContractBasic as Mock).mockRejectedValue(new Error('Failed to get contract'));

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

    expect(getContractBasic).toHaveBeenCalledTimes(1);
  });
});
