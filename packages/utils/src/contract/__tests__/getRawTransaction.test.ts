import getRawTransactionNight from '../getRawTransactionNight';
import getRawTransactionDiscover from '../getRawTransactionDiscover';
import getRawTransactionPortkey from '../getRawTransactionPortkey';
import { getRawTransaction } from '../getRawTransaction';
import { WalletTypeEnum, TWalletInfo } from '@aelf-web-login/wallet-adapter-base';

jest.mock('../getRawTransactionNight', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('encodedDataMock1'),
}));
jest.mock('../getRawTransactionDiscover', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('encodedDataMock2'),
}));
jest.mock('../getRawTransactionPortkey', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('encodedDataMock3'),
}));

describe('getRawTransaction', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
    const walletInfo: TWalletInfo = { address: 'mockAddress' };
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
    const walletInfo: TWalletInfo = { address: 'mockAddress' };

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    (getRawTransactionDiscover as jest.Mock).mockImplementation(() => {
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

    consoleLogSpy.mockRestore();
  });
});
