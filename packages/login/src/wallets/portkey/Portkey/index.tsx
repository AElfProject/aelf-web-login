import React, { ReactNode, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import {
  DIDWalletInfo,
  SignIn,
  Unlock,
  SignInInterface,
  modalMethod,
  TSignUpContinueHandler,
  setLoading,
  CustomSvg,
  TModalMethodRef,
  SignUpValue,
} from '@portkey/did-ui-react';
import { getConfig } from '../../../config';
import { WEB_LOGIN_VERSION, WebLoginState } from '../../../constants';
import { PortkeyOptions } from '../../../types';
import { FetchRequest } from '@portkey/request';
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
  const { chainId, onlyShowV2 } = getConfig();

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

  const switchVersion = useCallback(() => {
    const version = localStorage.getItem(WEB_LOGIN_VERSION)!;
    changePortkeyVersion(version);
  }, []);

  const onSignUpHandler: TSignUpContinueHandler = useCallback(
    async (identifierInfo) => {
      //
      let isLoginGuardian = false;
      const config = getConfig();
      const v1ServiceUrl = config.portkey.requestDefaults?.baseURL;
      if (v1ServiceUrl) {
        try {
          const customFetch = new FetchRequest({});

          setLoading(true);

          const result: any = await customFetch.send({
            // TODO get V1 service url from config
            url: `${v1ServiceUrl}/api/app/account/registerInfo`,
            method: 'GET',
            params: {
              loginGuardianIdentifier: identifierInfo.identifier.replaceAll(/\s/g, ''),
            },
          });
          if (result?.originChainId) {
            isLoginGuardian = true;
          }

          console.log(result, 'result==');
        } catch (error) {
          isLoginGuardian = false;
        } finally {
          setLoading(false);
        }
      }
      if (isLoginGuardian) {
        const modalRef: TModalMethodRef = { current: undefined };

        const isOk = await modalMethod({
          wrapClassName: 'aelf-switch-version-modal-wrapper',
          type: 'confirm',
          ref: modalRef,
          okText: 'Continue',
          cancelText: 'Switch',
          content: (
            <div className="modal-content">
              <CustomSvg
                type="Close2"
                className="aelf-switch-verison-close-icon"
                onClick={() => modalRef.current?.close()}
              />
              <h2 className="switch-version-title">Continue with this account?</h2>
              <div className="switch-version-inner">
                The account is not registered in the upgraded Portkey yet. Click &quot;Continue&quot; below to create a
                new account, separate from your existing one (Recommended). Alternatively, you can click
                &quot;Switch&quot; to access the existing account.
              </div>
            </div>
          ),
        });

        if (isOk) return SignUpValue.otherSeverRegisterButContinue;
        if (isOk === 0) return SignUpValue.cancelRegister;
        switchVersion();
        return SignUpValue.cancelRegister;
      }
      return SignUpValue.continue;
    },
    [switchVersion],
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

  const extraElement = useMemo(() => {
    const onlyShowV2 = getConfig().onlyShowV2;
    if (onlyShowV2) {
      return [extraWallets];
    } else {
      return [
        extraWallets,
        <div key="switch" className="switch-old-portkey-wrapper">
          Account registered in old Portkey? Log in&nbsp;
          <span className="switch-btn" onClick={switchVersion}>
            here
          </span>
        </div>,
      ];
    }
  }, [extraWallets, switchVersion]);

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
      extraElementList={extraElement}
      onCancel={onCancel}
      onError={onErrorInternal}
      onFinish={onFinishInternal}
      onSignUp={onlyShowV2 ? undefined : onSignUpHandler}
    />
  );
}
