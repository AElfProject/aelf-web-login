import {
  did,
  IGuardianIdentifierInfo,
  socialLoginAuth,
  useSignHandler,
  useSignInHandler,
  AddManagerType,
  useLoginWallet,
  TStep1LifeCycle,
  TStep2SignInLifeCycle,
  TStep3LifeCycle,
  TStep2SignUpLifeCycle,
  setLoading,
  handleErrorMessage,
  errorTip,
  TVerifierItem,
  IVerifyInfo,
  TelegramPlatform,
  DIDWalletInfo,
} from '@portkey/did-ui-react';
import { DEFAULT_PIN } from '../../../constants';
import { ChainId, NetworkType } from '@portkey/provider-types';

import { useCallback, useMemo, useState } from 'react';
import sleep from '../../../utils/sleep';
import useVerifier from './useVerifier';

export enum SocialLoginType {
  APPLE = 'Apple',
  GOOGLE = 'Google',
  TELEGRAM = 'Telegram',
}

export enum OperationTypeEnum {
  // unknown
  unknown = 0,
  // register
  register = 1,
  // community recovery
  communityRecovery = 2,
  // add guardian
  addGuardian = 3,
  // delete guardian
  deleteGuardian = 4,
  // edit guardian
  editGuardian = 5,
  // remove other manager
  removeOtherManager = 6,
  // set login account
  setLoginAccount = 7,
}

export type TSignUpVerifier = { verifier: TVerifierItem } & IVerifyInfo;

const useTelegram = (
  chainId: ChainId,
  network: NetworkType,
  onFinished: (didWalletInfo: DIDWalletInfo) => Promise<void>,
) => {
  const [currentLifeCircle, setCurrentLifeCircle] = useState<
    TStep2SignInLifeCycle | TStep1LifeCycle | TStep3LifeCycle | TStep2SignUpLifeCycle
  >({});
  const onSignInHandler = useSignInHandler({ isErrorTip: true });
  const createWallet = useLoginWallet();
  const { getRecommendationVerifier, verifySocialToken } = useVerifier();

  const onStep2OfSignUpFinish = useCallback(
    async (res: TSignUpVerifier, value?: IGuardianIdentifierInfo) => {
      const identifier = value;
      if (!identifier) return console.error('No guardianIdentifier!');
      const list = [
        {
          type: identifier?.accountType,
          identifier: identifier?.identifier,
          verifierId: res.verifier.id,
          verificationDoc: res.verificationDoc,
          signature: res.signature,
        },
      ];
      if (TelegramPlatform.isTelegramPlatform()) {
        const params = {
          pin: DEFAULT_PIN,
          type: 'register' as AddManagerType,
          chainId: chainId,
          accountType: identifier?.accountType,
          guardianIdentifier: identifier?.identifier,
          guardianApprovedList: list,
        };
        const createResult = await createWallet(params);
        createResult && onFinished(createResult);
      } else {
        // setCurrentLifeCircle({
        //   SetPinAndAddManager: {
        //     guardianIdentifierInfo: identifier,
        //     approvedList: list,
        //   },
        // });
        // setTimeout(() => {
        //   portkeyPanelRef.current?.open();
        // }, 500);
      }
    },
    [chainId, createWallet, onFinished],
  );

  const onSignUp = useCallback(
    async (value: IGuardianIdentifierInfo) => {
      try {
        setLoading(true, 'Assigning a verifier on-chain…');
        await sleep(2000);
        const verifier = await getRecommendationVerifier(chainId);
        setLoading(false);
        const { accountType, authenticationInfo, identifier } = value;
        if (
          accountType === SocialLoginType.APPLE ||
          accountType === SocialLoginType.GOOGLE ||
          accountType === SocialLoginType.TELEGRAM
        ) {
          setLoading(true);
          console.log('authenticationInfo', authenticationInfo);
          const operationDetails = JSON.stringify({
            manager: did.didWallet.managementAccount?.address,
          });

          const result = await verifySocialToken({
            accountType,
            token: authenticationInfo?.authToken,
            guardianIdentifier: identifier,
            verifier,
            chainId: chainId,
            operationType: OperationTypeEnum.register,
            operationDetails,
          });
          setLoading(false);
          console.log(result);
          if (!result?.signature || !result?.verificationDoc) throw 'Verify social login error';
          onStep2OfSignUpFinish(
            {
              verifier,
              verificationDoc: result.verificationDoc,
              signature: result.signature,
            },
            value,
          );
        }
      } catch (error) {
        setLoading(false);
        const errorMsg = handleErrorMessage(error);
        errorTip(
          {
            errorFields: 'Check sign up',
            error: errorMsg,
          },
          true,
          () => {
            console.log('error');
          },
        );
      }
    },
    [chainId, getRecommendationVerifier, onStep2OfSignUpFinish, verifySocialToken],
  );

  const handleSocialStep1Success = useCallback(
    async (value: IGuardianIdentifierInfo) => {
      // setDrawerVisible(false);
      // setModalVisible(false);
      console.log('handleSocialStep1Success');
      if (!did.didWallet.managementAccount) did.create();
      if (!value.isLoginGuardian) {
        await onSignUp(value as IGuardianIdentifierInfo);
      } else {
        const signResult = await onSignInHandler(value);
        if (!signResult) return;
        if (signResult.nextStep === 'SetPinAndAddManager') {
          const guardianIdentifierInfo = signResult.value.guardianIdentifierInfo;
          const approvedList = signResult.value.approvedList;
          if (!approvedList) return;
          const type: AddManagerType = guardianIdentifierInfo?.isLoginGuardian ? 'recovery' : 'register';
          const params = {
            pin: DEFAULT_PIN,
            type,
            chainId: guardianIdentifierInfo.chainId,
            accountType: guardianIdentifierInfo.accountType,
            guardianIdentifier: guardianIdentifierInfo?.identifier,
            guardianApprovedList: approvedList,
          };
          const didWallet = await createWallet(params);
          didWallet && onFinished(didWallet);
        } else {
          setLoading(false);
          setCurrentLifeCircle({
            [signResult.nextStep as any]: signResult.value,
          });
        }
      }
    },
    [createWallet, onFinished, onSignInHandler, onSignUp],
  );

  const signHandle = useSignHandler({
    onSuccess: handleSocialStep1Success,
    defaultChainId: chainId,
    customValidateEmail: undefined,
    customValidatePhone: undefined,
    onChainIdChange: undefined,
    onError: undefined,
  });

  const handleTelegram = useCallback(async () => {
    const res = await socialLoginAuth({
      type: SocialLoginType.TELEGRAM,
      network: network,
    });

    signHandle.onSocialFinish({
      type: res!.provider,
      data: { accessToken: res!.token },
    });
  }, [network, signHandle]);

  return useMemo(() => ({ handleTelegram, currentLifeCircle }), [handleTelegram, currentLifeCircle]);
};

export default useTelegram;
