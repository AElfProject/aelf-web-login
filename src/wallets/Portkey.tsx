import React, { ReactNode, useCallback } from 'react';
import { WalletComponentProps } from '../types';
import { DIDWalletInfo, SignIn } from '@portkey/did-ui-react';
import { PortkeyWallet } from '../wallet';

export function Portkey({
  open,
  onLogin,
  extraWallets,
}: WalletComponentProps & { open: boolean; extraWallets: ReactNode }) {
  const onPortkeyFinish = useCallback((didWallet: DIDWalletInfo) => {
    onLogin(undefined, new PortkeyWallet(didWallet));
  }, []);

  console.log(open);
  return <SignIn open={open} uiType="Modal" isShowScan extraElement={extraWallets} onFinish={onPortkeyFinish} />;
}
