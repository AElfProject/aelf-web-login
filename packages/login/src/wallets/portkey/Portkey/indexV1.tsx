import { ReactNode, useCallback, useRef, useEffect, useState } from 'react';
import {
  DIDWalletInfo,
  SignIn,
  Unlock,
  SignInInterface,
  modalMethod,
  TSignUpContinueHandler,
  setLoading,
  SignUpValue,
} from '@portkey-v1/did-ui-react';
import { getConfig } from '../../../config';
import { WEB_LOGIN_VERSION, WebLoginState } from '../../../constants';
import { PortkeyOptions } from '../../../types';
import { PortkeyDidV1, event$ } from '../../../index';
import { FetchRequest } from '@portkey-v1/request';
import { changePortkeyVersion } from '../../../utils/isPortkeyApp';

export default function Portkey({
  open,
  loginState,
  isManagerExists,
  portkeyOpts,
  onCancel,
  onFinish,
  onError,
  onUnlock,
  onCloseModal,
  extraWallets,
}: {
  open: boolean;
  loginState: WebLoginState;
  isManagerExists: boolean;
  portkeyOpts: PortkeyOptions;
  onCancel: () => void;
  onError: (error: any) => void;
  onFinish: (didWalletInfo: DIDWalletInfo) => void;
  onUnlock: (password: string) => Promise<boolean>;
  onCloseModal: () => void;
  extraWallets: ReactNode;
}) {
  const signInRef = useRef<SignInInterface>(null);
  const [password, setPassword] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const chainId = getConfig().chainId;

  useEffect(() => {
    if (signInRef.current) {
      signInRef.current.setOpen(open);
      if (!open) {
        onCloseModal();
      }
    }
  }, [onCloseModal, open]);

  const onFinishInternal = useCallback(
    (didWallet: DIDWalletInfo) => {
      onFinish(didWallet);
    },
    [onFinish],
  );

  const onErrorInternal = useCallback(
    (error: any) => {
      onError(error);
    },
    [onError],
  );

  const onUnlockInternal = useCallback(async () => {
    const success = await onUnlock(password);
    if (!success) {
      setIsWrongPassword(true);
    } else {
      setIsWrongPassword(false);
      setPassword('');
    }
  }, [onUnlock, password]);

  const changeVersion = useCallback(() => {
    const version = localStorage.getItem(WEB_LOGIN_VERSION)!;
    changePortkeyVersion(version);
  }, []);

  const onSignUpHandler: TSignUpContinueHandler = useCallback(
    async (identifierInfo) => {
      let isLoginGuardian = false;
      const config = getConfig();
      const v2ServiceUrl = config.portkeyV2?.requestDefaults?.baseURL;
      if (v2ServiceUrl) {
        try {
          const customFetch = new FetchRequest({});
          setLoading(true);
          const result: any = await customFetch.send({
            url: `${v2ServiceUrl}/api/app/account/registerInfo`,
            method: 'GET',
            params: {
              loginGuardianIdentifier: identifierInfo.identifier.trim(),
            },
          });
          if (result?.originChainId) {
            isLoginGuardian = true;
          }
        } catch (error) {
          isLoginGuardian = false;
        } finally {
          setLoading(false);
        }
      }

      const isOk = await modalMethod({
        wrapClassName: 'aelf-switch-version-modal-wrapper',
        type: 'confirm',
        okText: 'Continue',
        content: (
          <div className="modal-content">
            <h2 className="switch-version-title">Continue with this account?</h2>
            <div className="switch-version-inner">
              {isLoginGuardian
                ? 'The account is not registered in the current Portkey. You can click "Continue" below to use the fully upgraded Portkey and log in.'
                : 'This account is not registered yet. If you wish to create a Portkey account, we recommend using the fully upgraded Portkey for an enhanced experience. Click "Continue" below if you want to proceed.'}
            </div>
          </div>
        ),
      });

      if (isOk) {
        changeVersion();
      }
      return SignUpValue.cancelRegister;
    },
    [changeVersion],
  );

  if (isManagerExists && (loginState === WebLoginState.logining || loginState === WebLoginState.lock)) {
    return (
      <Unlock
        open={open}
        value={password}
        isWrongPassword={isWrongPassword}
        onChange={setPassword}
        onCancel={onCancel}
        onUnlock={onUnlockInternal}
      />
    );
  }

  const SignInComponent = portkeyOpts.SignInComponent || SignIn;
  return (
    <SignInComponent
      defaultChainId={chainId as any}
      ref={signInRef}
      uiType="Full"
      design={portkeyOpts.design}
      isShowScan
      extraElement={extraWallets}
      onCancel={onCancel}
      onSignUp={onSignUpHandler}
      onError={onErrorInternal}
      onFinish={onFinishInternal}
      upgradedPortkey={changeVersion}
    />
  );
}
