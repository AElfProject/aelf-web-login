import React, { ReactNode, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { DIDWalletInfo, SignIn, Unlock, SignInInterface } from '@portkey-v1/did-ui-react';
import { PortkeyDidV1 } from '../../index';
import { getConfig } from '../../config';
import { WebLoginState } from '../../constants';
import { PortkeyOptions } from '../../types';

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
  console.log('use me v1');
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

  if (isManagerExists && (loginState === WebLoginState.logining || loginState === WebLoginState.lock)) {
    return (
      <PortkeyDidV1.Unlock
        open={open}
        value={password}
        isWrongPassword={isWrongPassword}
        onChange={setPassword}
        onCancel={onCancel}
        onUnlock={onUnlockInternal}
      />
    );
  }

  const SignInComponent = portkeyOpts.SignInComponent || PortkeyDidV1.SignIn;
  return (
    <SignInComponent
      defaultChainId={chainId as any}
      ref={signInRef}
      uiType="Modal"
      design={portkeyOpts.design}
      isShowScan
      extraElement={extraWallets}
      onCancel={onCancel}
      onError={onErrorInternal}
      onFinish={onFinishInternal}
    />
  );
}
