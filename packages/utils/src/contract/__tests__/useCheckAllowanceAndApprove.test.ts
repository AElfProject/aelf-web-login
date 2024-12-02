import { renderHook, act } from '@testing-library/react';
import { useCheckAllowanceAndApprove } from '../useCheckAllowanceAndApprove';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { type TChainId } from '@aelf-web-login/wallet-adapter-base';
import { type Mock } from 'vitest';

vi.mock('@aelf-web-login/wallet-adapter-react', () => ({
  // ...vi.requireActual('@aelf-web-login/wallet-adapter-react'),
  useConnectWallet: vi.fn(),
}));

describe('useCheckAllowanceAndApprove allowance is little than amount', () => {
  let mockCallViewMethod: Mock;
  let mockCallSendMethod: Mock;

  beforeEach(() => {
    mockCallViewMethod = vi.fn((params) => {
      switch (params.methodName) {
        case 'GetAllowance':
          return Promise.resolve({
            data: {},
          });
        case 'GetTokenInfo':
          return Promise.resolve({
            data: {},
          });
        default:
          return Promise.reject(new Error('Unsupported method'));
      }
    });
    mockCallSendMethod = vi.fn();
    (useConnectWallet as Mock).mockReturnValue({
      callViewMethod: mockCallViewMethod,
      callSendMethod: mockCallSendMethod,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly call GetAllowance and GetTokenInfo when starting', async () => {
    const tokenContractAddress = 'mockTokenAddress';
    const approveTargetAddress = 'mockApproveAddress';
    const account = 'mockAccount';
    const amount = '100';
    const symbol = 'ELF';
    const chainId: TChainId = 'tDVW';

    const { result } = renderHook(() =>
      useCheckAllowanceAndApprove({
        tokenContractAddress,
        approveTargetAddress,
        account,
        amount,
        symbol,
        chainId,
      }),
    );

    expect(result.current.loading).toBe(false);

    const isSuccess = await act(async () => {
      return await result.current.start();
    });

    expect(isSuccess).toBe(true);
    expect(mockCallViewMethod).toHaveBeenCalledTimes(2);
    expect(mockCallViewMethod).toHaveBeenCalledWith({
      chainId,
      contractAddress: tokenContractAddress,
      methodName: 'GetAllowance',
      args: { symbol, owner: account, spender: approveTargetAddress },
    });
    expect(mockCallViewMethod).toHaveBeenCalledWith({
      chainId,
      contractAddress: tokenContractAddress,
      methodName: 'GetTokenInfo',
      args: { symbol },
    });
  });

  it('should log and return error when an error occurs', async () => {
    (mockCallViewMethod as Mock).mockImplementation(() => {
      throw new Error('failed');
    });
  });
});

describe('useCheckAllowanceAndApprove allowance is big than amount', () => {
  let mockCallViewMethod: Mock;
  let mockCallSendMethod: Mock;

  beforeEach(() => {
    mockCallViewMethod = vi.fn((params) => {
      switch (params.methodName) {
        case 'GetAllowance':
          return Promise.resolve({
            data: {
              allowance: 10000000000,
            },
          });
        case 'GetTokenInfo':
          return Promise.resolve({
            data: {
              decimals: 8,
            },
          });
        default:
          return Promise.reject(new Error('Unsupported method'));
      }
    });
    mockCallSendMethod = vi.fn();
    (useConnectWallet as Mock).mockReturnValue({
      callViewMethod: mockCallViewMethod,
      callSendMethod: mockCallSendMethod,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly call GetAllowance and GetTokenInfo when starting', async () => {
    const tokenContractAddress = 'mockTokenAddress';
    const approveTargetAddress = 'mockApproveAddress';
    const account = 'mockAccount';
    const amount = '1';
    const symbol = 'ELF';
    const chainId: TChainId = 'tDVW';

    const { result } = renderHook(() =>
      useCheckAllowanceAndApprove({
        tokenContractAddress,
        approveTargetAddress,
        account,
        amount,
        symbol,
        chainId,
      }),
    );

    expect(result.current.loading).toBe(false);

    const isSuccess = await act(async () => {
      return await result.current.start();
    });

    expect(isSuccess).toBe(true);
  });
});

describe('useCheckAllowanceAndApprove error occurs', () => {
  let mockCallViewMethod: Mock;
  let mockCallSendMethod: Mock;

  beforeEach(() => {
    mockCallViewMethod = vi.fn();
    mockCallSendMethod = vi.fn();
    (useConnectWallet as Mock).mockReturnValue({
      callViewMethod: mockCallViewMethod,
      callSendMethod: mockCallSendMethod,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should log and return error when an error occurs', async () => {
    const tokenContractAddress = 'mockTokenAddress';
    const approveTargetAddress = 'mockApproveAddress';
    const account = 'mockAccount';
    const amount = '100';
    const symbol = 'ELF';
    const chainId: TChainId = 'tDVW';

    const { result } = renderHook(() =>
      useCheckAllowanceAndApprove({
        tokenContractAddress,
        approveTargetAddress,
        account,
        amount,
        symbol,
        chainId,
      }),
    );
    (mockCallViewMethod as Mock).mockImplementation(() => {
      throw new Error('failed');
    });

    const isSuccess = await act(async () => {
      return await result.current.start();
    });

    expect(isSuccess).not.toBe(true);
  });
});
