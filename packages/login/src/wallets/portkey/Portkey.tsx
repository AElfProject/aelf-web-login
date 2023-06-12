import React, { ReactNode, useCallback, useRef, useEffect, useState } from 'react';
import { DIDWalletInfo, SignIn, Unlock, SignInInterface } from '@portkey/did-ui-react';
import { getConfig } from '../../config';
import { WebLoginState } from '../../constants';

export default function Portkey({
  open,
  loginState,
  isManagerExists,
  onCancel,
  onFinish,
  onError,
  onUnlock,
  extraWallets,
}: {
  open: boolean;
  loginState: WebLoginState;
  isManagerExists: boolean;
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

  if (isManagerExists && (loginState === WebLoginState.logining || loginState == WebLoginState.lock)) {
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
