import React, { ReactNode, useCallback, useRef, useEffect, useState } from 'react';
import { DIDWalletInfo, SignIn, Unlock, SignInInterface } from '@portkey/did-ui-react';
import { getConfig } from '../../config';
import { WebLoginState } from '../../constants';
import { PortkeyComponentRenderer, PortkeyOptions } from '../../types';

export default function Portkey({
  open,
  loginState,
  isManagerExists,
  portkeyOpts,
  onCancel,
  onFinish,
  onError,
  onUnlock,
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
  extraWallets: ReactNode;
}) {
  const signInRef = useRef<SignInInterface>(null);
  const [password, setPassword] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const chainId = getConfig().chainId;

  useEffect(() => {
    if (signInRef.current) {
      signInRef.current.setOpen(open);
    }
  }, [open]);

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

  const renderPortkeyComponentDefault: PortkeyComponentRenderer = (Component, props) => {
    return <Component {...props} />;
  };

  const renderPortkeyComponent = portkeyOpts?.renderPortkeyComponent || renderPortkeyComponentDefault;

  if (isManagerExists && (loginState === WebLoginState.logining || loginState === WebLoginState.lock)) {
    if (renderPortkeyComponent) {
      return renderPortkeyComponent(Unlock, {
        open,
        value: password,
        isWrongPassword,
        onChange: setPassword,
        onCancel,
        onUnlock: onUnlockInternal,
      });
    }

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

  if (renderPortkeyComponent) {
    return renderPortkeyComponent(SignIn, {
      defaultChainId: chainId as any,
      ref: signInRef,
      uiType: 'Modal',
      isShowScan: true,
      extraElement: extraWallets,
      onCancel,
      onError: onErrorInternal,
      onFinish: onFinishInternal,
    });
  }

  return (
    <SignIn
      defaultChainId={chainId as any}
      ref={signInRef}
      uiType="Modal"
      isShowScan
      extraElement={extraWallets}
      onCancel={onCancel}
      onError={onErrorInternal}
      onFinish={onFinishInternal}
    />
  );
}
