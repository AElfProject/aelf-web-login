import { renderHook, act } from '@testing-library/react-hooks';
import useVerifier from '../useVerifier';
import { did, ConfigProvider, useVerifyToken, IVerifier } from '@portkey/did-ui-react';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { OperationTypeEnum } from '@portkey/services';

jest.mock('@portkey/did-ui-react', () => ({
  did: {
    services: {
      getRecommendationVerifier: jest.fn(),
    },
  },
  ConfigProvider: {
    getSocialLoginConfig: jest.fn(),
  },
  useVerifyToken: jest.fn(),
}));

jest.mock('@aelf-web-login/wallet-adapter-base', () => ({
  TChainId: {
    AELF: 'AELF',
  },
}));

jest.mock('@portkey/services', () => ({
  AccountType: {
    Apple: 'Apple',
    Google: 'Google',
    Telegram: 'Telegram',
  },
  OperationTypeEnum: {
    Login: 'Login',
  },
}));

describe('useVerifier', () => {
  const mockVerifyToken = jest.fn();
  const mockGetRecommendationVerifier = jest.fn();
  const mockSocialLoginConfig = {
    Apple: {
      clientId: 'apple-client-id',
      redirectURI: 'apple-redirect-uri',
      customLoginHandler: jest.fn(),
    },
    Google: {
      clientId: 'google-client-id',
      customLoginHandler: jest.fn(),
    },
    Telegram: {
      customLoginHandler: jest.fn(),
    },
  };

  beforeEach(() => {
    (did.services.getRecommendationVerifier as jest.Mock).mockReturnValue(
      mockGetRecommendationVerifier,
    );
    (ConfigProvider.getSocialLoginConfig as jest.Mock).mockReturnValue(mockSocialLoginConfig);
    (useVerifyToken as jest.Mock).mockReturnValue(mockVerifyToken);
  });

  it('should return getRecommendationVerifier and verifySocialToken functions', () => {
    const { result } = renderHook(() => useVerifier());

    expect(result.current.getRecommendationVerifier).toBeInstanceOf(Function);
    expect(result.current.verifySocialToken).toBeInstanceOf(Function);
  });

  it('should call getRecommendationVerifier with correct chainId', async () => {
    const chainId: TChainId = 'AELF';
    const { result } = renderHook(() => useVerifier());

    await act(async () => {
      await result.current.getRecommendationVerifier(chainId);
    });

    expect(did.services.getRecommendationVerifier).toHaveBeenCalledWith({ chainId });
  });

  it('should handle Apple account type correctly', async () => {
    const chainId: TChainId = 'AELF';
    const { result } = renderHook(() => useVerifier());

    await act(async () => {
      await result.current.verifySocialToken({
        accountType: 'Apple',
        token: 'apple-token',
        guardianIdentifier: 'guardian-id',
        verifier: { id: 'verifier-id' } as IVerifier,
        chainId,
        operationType: OperationTypeEnum.register,
        operationDetails: 'login-details',
      });
    });

    expect(mockVerifyToken).toHaveBeenCalledWith('Apple', expect.any(Object));
  });

  it('should handle Google account type correctly', async () => {
    const chainId: TChainId = 'AELF';
    const { result } = renderHook(() => useVerifier());

    await act(async () => {
      await result.current.verifySocialToken({
        accountType: 'Google',
        token: 'google-token',
        guardianIdentifier: 'guardian-id',
        verifier: { id: 'verifier-id' } as IVerifier,
        chainId,
        operationType: OperationTypeEnum.register,
        operationDetails: 'login-details',
      });
    });

    expect(mockVerifyToken).toHaveBeenCalledWith('Google', expect.any(Object));
  });

  it('should handle Telegram account type correctly', async () => {
    const chainId: TChainId = 'AELF';
    const { result } = renderHook(() => useVerifier());

    await act(async () => {
      await result.current.verifySocialToken({
        accountType: 'Telegram',
        token: 'telegram-token',
        guardianIdentifier: 'guardian-id',
        verifier: { id: 'verifier-id' } as IVerifier,
        chainId,
        operationType: OperationTypeEnum.register,
        operationDetails: 'login-details',
      });
    });

    expect(mockVerifyToken).toHaveBeenCalledWith('Telegram', expect.any(Object));
  });

  it('should throw error for unsupported account type', async () => {
    const chainId: TChainId = 'AELF';
    const { result } = renderHook(() => useVerifier());

    await act(async () => {
      try {
        await result.current.verifySocialToken({
          accountType: 'Unsupported' as any,
          token: 'unsupported-token',
          guardianIdentifier: 'guardian-id',
          verifier: { id: 'verifier-id' } as IVerifier,
          chainId,
          operationType: OperationTypeEnum.register,
          operationDetails: 'login-details',
        });
      } catch (error) {
        expect(error).toBe('accountType is not supported');
      }
    });
  });

  it('should throw error if verifier is missing', async () => {
    const chainId: TChainId = 'AELF';
    const { result } = renderHook(() => useVerifier());

    await act(async () => {
      try {
        await result.current.verifySocialToken({
          accountType: 'Apple',
          token: 'apple-token',
          guardianIdentifier: 'guardian-id',
          verifier: { id: '' } as IVerifier,
          chainId,
          operationType: OperationTypeEnum.register,
          operationDetails: 'login-details',
        });
      } catch (error) {
        expect(error).toBe('Verifier is not missing');
      }
    });
  });
});
