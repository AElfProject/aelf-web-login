import getRawTransactionPortkey, {
  IRowTransactionPortkeyParams,
} from '../getRawTransactionPortkey';
import { getContractBasic } from '@portkey/contracts';
import { aelf } from '@portkey/utils';

jest.mock('@portkey/contracts', () => ({
  getContractBasic: jest.fn(),
}));

jest.mock('@portkey/utils', () => ({
  aelf: {
    getWallet: jest.fn(),
  },
}));

describe('getRawTransactionPortkey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return encoded transaction data', async () => {
    const mockContract = {
      encodedTx: jest.fn().mockResolvedValue({ data: 'encodedDataMock' }),
    };
    (getContractBasic as jest.Mock).mockResolvedValue(mockContract);

    (aelf.getWallet as jest.Mock).mockReturnValue({
      address: 'testAddress',
    });

    const params: IRowTransactionPortkeyParams = {
      caHash: '0xExampleCaHash',
      privateKey: '0xExamplePrivateKey',
      contractAddress: '0xExampleContractAddress',
      caContractAddress: '0xExampleCaContractAddress',
      rpcUrl: 'https://example-rpc-url.com',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
    };

    const result = await getRawTransactionPortkey(params);
    expect(result).toBe('encodedDataMock');

    expect(getContractBasic).toHaveBeenCalledTimes(1);
    expect(getContractBasic).toHaveBeenCalledWith({
      callType: 'ca',
      caHash: '0xExampleCaHash',
      account: expect.any(Object),
      contractAddress: '0xExampleContractAddress',
      caContractAddress: '0xExampleCaContractAddress',
      rpcUrl: 'https://example-rpc-url.com',
    });

    expect(mockContract.encodedTx).toHaveBeenCalledTimes(1);
    expect(mockContract.encodedTx).toHaveBeenCalledWith('exampleMethod', { exampleParam: 'value' });
  });

  it('should reject with error when getContractBasic fails', async () => {
    (getContractBasic as jest.Mock).mockRejectedValue(new Error('Failed to get contract'));

    const params: IRowTransactionPortkeyParams = {
      caHash: '0xExampleCaHash',
      privateKey: '0xExamplePrivateKey',
      contractAddress: '0xExampleContractAddress',
      caContractAddress: '0xExampleCaContractAddress',
      rpcUrl: 'https://example-rpc-url.com',
      params: { exampleParam: 'value' },
      methodName: 'exampleMethod',
    };

    try {
      await getRawTransactionPortkey(params);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    expect(getContractBasic).toHaveBeenCalledTimes(1);
  });
});
