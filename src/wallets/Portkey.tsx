import React, { ReactNode, useCallback, useRef, useEffect, useState } from 'react';
import { WalletComponentProps } from '../types';
import { DIDWalletInfo, SignIn, Unlock, SignInInterface, did } from '@portkey/did-ui-react';
import { PortkeyWallet } from '../wallet';
import { useWebLoginContext } from '../context';
import { getConfig } from '../config';

export function Portkey({
  open,
  onLogin,
  extraWallets,
}: WalletComponentProps & { open: boolean; extraWallets: ReactNode }) {
  const signInRef = useRef<SignInInterface>(null);
  const { setModalOpen } = useWebLoginContext();
  const [password, setPassword] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);

  const appName = getConfig().appName;
  // TODO: fix this
  const CHAIN_ID = 'AELF';

  useEffect(() => {
    if (signInRef.current) {
      signInRef.current.setOpen(open);
    }
  }, [open]);

  const onCancel = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const onFinish = useCallback(
    (didWallet: DIDWalletInfo) => {
      onLogin(undefined, new PortkeyWallet(appName, CHAIN_ID, didWallet));
    },
    [appName],
  );

  const onUnlock = useCallback(async () => {
    const localWallet = await did.load(password, appName);
    if (!localWallet.didWallet.accountInfo.loginAccount) {
      setIsWrongPassword(true);
      return;
    }

    let caInfo = localWallet.didWallet.caInfo[CHAIN_ID];
    let caHash = caInfo?.caHash;
    if (!caInfo) {
      const key = Object.keys(localWallet.didWallet.caInfo)[0];
      caHash = localWallet.didWallet.caInfo[key].caHash;
      caInfo = await did.didWallet.getHolderInfoByContract({
        caHash: caHash,
        chainId: CHAIN_ID,
      });
    }

    const didWalletInfo: DIDWalletInfo = {
      caInfo,
      pin: '',
      chainId: CHAIN_ID,
      walletInfo: localWallet.didWallet.managementAccount!.wallet as any, // TODO
      accountInfo: localWallet.didWallet.accountInfo as any,
    };
    onFinish(didWalletInfo);
    setIsWrongPassword(false);
    setPassword('');
  }, [setIsWrongPassword, onFinish, setPassword, password, appName]);

  if (PortkeyWallet.checkLocal(appName)) {
    return (
      <Unlock
        open={open}
        value={password}
        isWrongPassword={isWrongPassword}
        onChange={setPassword}
        onCancel={onCancel}
        onUnlock={onUnlock}
      />
    );
  }

  return (
    <SignIn
      defaultChainId={CHAIN_ID}
      sandboxId="portkey-ui-sandbox"
      ref={signInRef}
      uiType="Modal"
      isShowScan
      extraElement={extraWallets}
      onCancel={onCancel}
      onFinish={onFinish}
    />
  );
}
