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
  onUnlock,
  extraWallets,
}: {
  open: boolean;
  loginState: WebLoginState;
  isManagerExists: boolean;
  onCancel: () => void;
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

  const onUnlockInternal = useCallback(async () => {
    const success = await onUnlock(password);
    if (!success) {
      setIsWrongPassword(false);
      setPassword('');
    } else {
      setIsWrongPassword(true);
      setPassword('');
    }
  }, [onUnlock, password]);

  console.log(loginState);

  if (isManagerExists) {
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
      sandboxId="portkey-ui-sandbox"
      ref={signInRef}
      uiType="Modal"
      isShowScan
      extraElement={extraWallets}
      onCancel={onCancel}
      onFinish={onFinishInternal}
    />
  );
}
