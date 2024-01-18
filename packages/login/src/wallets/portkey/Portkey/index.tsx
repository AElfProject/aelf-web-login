import React, { ReactNode, useCallback, useRef, useEffect, useState } from 'react';
import {
  DIDWalletInfo,
  SignIn,
  Unlock,
  SignInInterface,
  modalMethod,
  TSignUpContinueHandler,
  setLoading,
} from '@portkey/did-ui-react';
import { event$, getConfig } from '../../../config';
import { WebLoginState } from '../../../constants';
import { PortkeyOptions } from '../../../types';
import { FetchRequest } from '@portkey/request';

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

  const onSignUpHandler: TSignUpContinueHandler = useCallback(async (identifierInfo) => {
    //
    let isLoginGuardian = false;
    try {
      const customFetch = new FetchRequest({});
      const config = getConfig();

      const v1ServiceUrl = config.portkey.requestDefaults?.baseURL;
      if (!v1ServiceUrl) return true;
      setLoading(true);

      const result: any = await customFetch.send({
        // TODO get V1 service url from config
        url: `${v1ServiceUrl}/api/app/account/registerInfo`,
        method: 'GET',
        params: {
          loginGuardianIdentifier: identifierInfo.identifier,
        },
      });
      isLoginGuardian = true;
      console.log(result, 'result==');
    } catch (error) {
      isLoginGuardian = false;
    } finally {
      setLoading(false);
    }
    if (isLoginGuardian) {
      const isOk = await modalMethod({
        wrapClassName: 'aelf-switch-version-modal-wrapper',
        type: 'confirm',
        okText: 'Signup',
        cancelText: 'Switch',
        content: (
          <div className="modal-content">
            <h2 className="switch-version-title">Continue with this account?</h2>

            <div className="switch-version-inner">
              The account you are currently logged in with does not exist, and the account has been detected to exist in
              V1. You can switch to V1 for login, or register in the current version.
            </div>
          </div>
        ),
      });
      if (isOk) return true;

      // TODO switch to V1
      // signInRef.current?.setOpen(false);
      event$.emit({
        version: '1',
      });
      return false;
    }
    return true;
  }, []);

  const onUnlockInternal = useCallback(async () => {
    const success = await onUnlock(password);
    if (!success) {
      setIsWrongPassword(true);
    } else {
      setIsWrongPassword(false);
      setPassword('');
    }
  }, [onUnlock, password]);

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
      uiType="Modal"
      design={'SocialDesign'}
      isShowScan
      extraElement={extraWallets}
      onCancel={onCancel}
      onError={onErrorInternal}
      onFinish={onFinishInternal}
      onSignUp={onSignUpHandler}
    />
  );
}
