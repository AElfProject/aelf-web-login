import { ReactNode, useCallback, useRef, useEffect, useState } from 'react';
import {
  DIDWalletInfo,
  SignIn,
  Unlock,
  SignInInterface,
  modalMethod,
  TSignUpContinueHandler,
  setLoading,
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

  const onSignUpHandler: TSignUpContinueHandler = useCallback(async (identifierInfo) => {
    //
    let isLoginGuardian = false;
    try {
      const customFetch = new FetchRequest({});
      setLoading(true);
      const config = getConfig();
      const serviceUrl = config.portkey.requestDefaults?.baseURL;
      if (!serviceUrl) return true;
      const result: any = await customFetch.send({
        // TODO get V2 service url
        url: `${serviceUrl}/api/app/account/registerInfo`,
        method: 'GET',
        params: {
          loginGuardianIdentifier: identifierInfo.identifier,
        },
      });
      isLoginGuardian = true;
    } catch (error) {
      isLoginGuardian = false;
    } finally {
      setLoading(false);
    }
    if (isLoginGuardian) {
      const isOk = await modalMethod({
        wrapClassName: 'aelf-switch-version-modal-wrapper',
        type: 'confirm',
        okText: 'Switch',
        content: (
          <div className="modal-content">
            <h2 className="switch-version-title">Continue with this account?</h2>
            <div className="switch-version-inner">
              This account is not registered yet. If you wish to create a Portkey account, we recommend using the fully
              upgraded Portkey for an enhanced experience.
            </div>
          </div>
        ),
      });
      if (isOk) {
        const version = localStorage.getItem(WEB_LOGIN_VERSION)!;
        changePortkeyVersion(version);
        return false;
      }
      return true;
    }
    return true;
  }, []);

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
      design={portkeyOpts.design}
      isShowScan
      extraElement={extraWallets}
      onCancel={onCancel}
      onSignUp={onSignUpHandler}
      onError={onErrorInternal}
      onFinish={onFinishInternal}
    />
  );
}
