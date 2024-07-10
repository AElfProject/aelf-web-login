import { useCallback, useMemo } from 'react';
import {
  did,
  ConfigProvider,
  IVerifier,
  useVerifyToken,
  ISocialLoginConfig,
} from '@portkey/did-ui-react';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { AccountType, OperationTypeEnum } from '@portkey/services';

const useVerifier = () => {
  const verifyToken = useVerifyToken();

  const socialLogin = useMemo<ISocialLoginConfig | undefined>(
    () => ConfigProvider.getSocialLoginConfig(),
    [],
  );

  const getRecommendationVerifier: (chainId: TChainId) => Promise<IVerifier> = useCallback(
    async (chainId) =>
      did.services.getRecommendationVerifier({
        chainId,
      }),
    [],
  );

  const verifySocialToken = useCallback(
    async ({
      accountType,
      token,
      guardianIdentifier,
      verifier,
      chainId,
      operationType,
      operationDetails,
    }: {
      guardianIdentifier: string;
      accountType: AccountType;
      token?: string;
      verifier: IVerifier;
      chainId: TChainId;
      operationType: OperationTypeEnum;
      operationDetails: string;
    }) => {
      let accessToken;
      let clientId;
      let redirectURI;
      let customLoginHandler;
      switch (accountType) {
        case 'Apple':
          accessToken = token;
          clientId = socialLogin?.Apple?.clientId;
          redirectURI = socialLogin?.Apple?.redirectURI;
          customLoginHandler = socialLogin?.Apple?.customLoginHandler;
          break;
        case 'Google':
          accessToken = token;
          clientId = socialLogin?.Google?.clientId;
          customLoginHandler = socialLogin?.Google?.customLoginHandler;
          break;
        case 'Telegram':
          accessToken = token;
          customLoginHandler = socialLogin?.Telegram?.customLoginHandler;
          break;
        default:
          throw 'accountType is not supported';
      }
      if (!verifier?.id) throw 'Verifier is not missing';
      return verifyToken(accountType, {
        accessToken,
        id: guardianIdentifier,
        verifierId: verifier.id,
        chainId,
        clientId: clientId ?? '',
        redirectURI,
        operationType,
        operationDetails,
        customLoginHandler,
      });
    },
    [socialLogin, verifyToken],
  );

  return useMemo(
    () => ({ getRecommendationVerifier, verifySocialToken }),
    [getRecommendationVerifier, verifySocialToken],
  );
};

export default useVerifier;
