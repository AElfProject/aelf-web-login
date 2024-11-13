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
  CreatePendingInfo,
  TOnSuccessExtraData,
  UserGuardianStatus,
  useMultiVerify,
  ConfigProvider,
} from '@portkey/did-ui-react';
import {
  TChainId,
  NetworkEnum,
  utils,
  OperationTypeEnum,
} from '@aelf-web-login/wallet-adapter-base';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Bridge } from './bridge';
import useVerifier from './useVerifier';
import useLockCallback from './useLockCallback';

const { sleep } = utils;

export enum SocialLoginType {
  APPLE = 'Apple',
  GOOGLE = 'Google',
  TELEGRAM = 'Telegram',
}

export type TSignUpVerifier = { verifier: TVerifierItem } & IVerifyInfo;

const useTelegram = (
  enableAcceleration = false,
  DEFAULT_PIN = '111111',
  chainId: TChainId,
  network: NetworkEnum,
  bridgeInstance: Bridge,
  setIsShowWrapper: (arg: boolean) => void,
) => {
  const [originChainId, setOriginChainId] = useState<TChainId>(chainId);
  const [caHash, setCaHash] = useState<string>('');
  const [approvalVisible, setApprovalVisible] = useState(false);
  const caInfoRef = useRef<{ caAddress: string; caHash: string }>({ caAddress: '', caHash: '' });
  const identifierRef = useRef<string>();
  const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>();
  const multiVerify = useMultiVerify();
  const isTelegramPlatform = useMemo(() => {
    return TelegramPlatform.isTelegramPlatform();
  }, []);

  const onCreatePendingHandler = useLockCallback(async (createPendingInfo: CreatePendingInfo) => {
    if (!enableAcceleration) {
      return;
    }
    if (createPendingInfo.createType === 'register') {
      return;
    }
    console.log('intg-----------onCreatePendingHandler,');
    bridgeInstance.onPortkeyAAWalletCreatePending(createPendingInfo);
  }, []);
  const [currentLifeCircle, setCurrentLifeCircle] = useState<
    TStep2SignInLifeCycle | TStep1LifeCycle | TStep3LifeCycle | TStep2SignUpLifeCycle
  >({});

  const handleFinish = useCallback(async () => {
    if (!enableAcceleration) {
      return;
    }
    console.log('intg-----------handleFinish');
    await bridgeInstance.onPortkeyAAWalletCreatePending({
      pin: DEFAULT_PIN,
      sessionId: 'tmp_beforeLastGuardianApprove', // ensure this is a sessionId
      didWallet: {
        pin: DEFAULT_PIN,
        chainId: originChainId,
        caInfo: caInfoRef.current,
      },
    } as CreatePendingInfo);
  }, [DEFAULT_PIN, bridgeInstance, enableAcceleration, originChainId]);

  const beforeLastGuardianApprove = () => {
    if (isTelegramPlatform) {
      console.log('intg-----------beforeLastGuardianApprove');
      handleFinish();
    }
  };
  const onSignInHandler = useSignInHandler({ isErrorTip: true, beforeLastGuardianApprove });
  const createWallet = useLoginWallet({
    onCreatePending: onCreatePendingHandler,
  });
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
      if (isTelegramPlatform) {
        const params = {
          pin: DEFAULT_PIN,
          type: 'register' as AddManagerType,
          chainId: chainId,
          accountType: identifier?.accountType,
          guardianIdentifier: identifier?.identifier,
          guardianApprovedList: list,
        };
        const createResult = await createWallet(params);
        createResult && bridgeInstance.onPortkeyAAWalletLoginFinished(createResult);
      } else {
        // setCurrentLifeCircle({
        //   SetPinAndAddManager: {
        //     guardianIdentifierInfo: identifier,
        //     approvedList: list,
        //   },
        // });
        // setTimeout(() => {
        //   setIsShowWrapper(true);
        // }, 500);
      }
    },
    [DEFAULT_PIN, bridgeInstance, chainId, createWallet, isTelegramPlatform],
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

  const handleSocialStep1Success = useLockCallback(
    async (value: IGuardianIdentifierInfo, extraData?: TOnSuccessExtraData) => {
      // setDrawerVisible(false);
      // setModalVisible(false);
      if (enableAcceleration && extraData) {
        setOriginChainId(extraData.originChainId);
        setCaHash(extraData.caHash);
        caInfoRef.current = {
          caAddress: extraData.caAddress,
          caHash: extraData.caHash,
        };
      }
      if (!did.didWallet.managementAccount) did.create();
      if (!value.isLoginGuardian) {
        await onSignUp(value as IGuardianIdentifierInfo);
      } else {
        const signResult = await onSignInHandler(value);
        if (!signResult) return;
        identifierRef.current = signResult.value.guardianIdentifierInfo?.identifier;
        if (signResult.nextStep === 'SetPinAndAddManager' && isTelegramPlatform) {
          const guardianIdentifierInfo = signResult.value.guardianIdentifierInfo;
          const approvedList = signResult.value.approvedList;
          if (!approvedList) return;
          const type: AddManagerType = guardianIdentifierInfo?.isLoginGuardian
            ? 'recovery'
            : 'register';
          const params = {
            pin: DEFAULT_PIN,
            type,
            chainId: guardianIdentifierInfo.chainId,
            accountType: guardianIdentifierInfo.accountType,
            guardianIdentifier: guardianIdentifierInfo?.identifier,
            guardianApprovedList: approvedList,
          };
          const didWallet = await createWallet(params);
          if (enableAcceleration && type === 'recovery') {
            console.log('intg-----------handleSocialStep1Success');
            didWallet && bridgeInstance.onPortkeyAAWalletLoginFinishedWithAcceleration(didWallet);
          } else {
            didWallet && bridgeInstance.onPortkeyAAWalletLoginFinished(didWallet);
          }
        } else {
          setLoading(false);
          if (isTelegramPlatform && enableAcceleration) {
            console.log('intg-----------more guardian', signResult.value.guardianList);
            setGuardianList(signResult.value.guardianList || []);
            setTimeout(() => {
              setApprovalVisible(true);
              ConfigProvider.setGlobalConfig({
                globalLoadingHandler: undefined,
              });
            }, 500);
            return;
          }
          setCurrentLifeCircle({
            [signResult.nextStep as any]: signResult.value,
          });
          setTimeout(() => {
            setIsShowWrapper(true);
          }, 500);
        }
      }
    },
    [bridgeInstance, createWallet, onSignInHandler, onSignUp, setIsShowWrapper, DEFAULT_PIN],
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
    try {
      const res = await socialLoginAuth({
        type: SocialLoginType.TELEGRAM,
        network: network,
      });

      console.log('socialLoginAuth', res);

      signHandle.onSocialFinish({
        type: res!.provider,
        data: { accessToken: res!.token },
      });
    } catch (e) {
      console.log('execute await socialLoginAuth error', e);
    }
  }, [network, signHandle]);

  const onTGSignInApprovalSuccess = useCallback(
    async (guardian: any) => {
      ConfigProvider.setGlobalConfig({
        globalLoadingHandler: {
          onSetLoading: (loadingInfo) => {
            console.log(loadingInfo, 'loadingInfo===');
          },
        },
      });
      setApprovalVisible(false);
      await handleFinish();
      const res = await multiVerify(guardian);
      const params = {
        pin: DEFAULT_PIN,
        type: 'recovery' as AddManagerType,
        chainId: originChainId,
        accountType: 'Telegram' as any,
        guardianIdentifier: identifierRef.current || '',
        guardianApprovedList: res as any[],
      };
      console.log('intg-----------onTGSignInApprovalSuccess', params);
      const didWallet = await createWallet(params);

      didWallet && bridgeInstance.onPortkeyAAWalletLoginFinishedWithAcceleration(didWallet);
    },
    [DEFAULT_PIN, bridgeInstance, createWallet, handleFinish, multiVerify, originChainId],
  );

  return useMemo(
    () => ({
      handleTelegram,
      currentLifeCircle,
      guardianList,
      approvalVisible,
      setApprovalVisible,
      caHash,
      originChainId,
      onTGSignInApprovalSuccess,
    }),
    [
      handleTelegram,
      currentLifeCircle,
      guardianList,
      approvalVisible,
      caHash,
      originChainId,
      onTGSignInApprovalSuccess,
    ],
  );
};

export default useTelegram;
