import React, { ReactNode, useCallback, useRef, useEffect, useState } from 'react';
import { ChainId } from '@portkey/types';
import { WalletComponentProps } from '../types';
import { DIDWalletInfo, SignIn, Unlock, SignInInterface, did } from '@portkey/did-ui-react';
import { PortkeyWallet } from '../wallet';
import { useWebLoginContext } from '../context';
import { getConfig } from '../config';
export function Portkey({ open, extraWallets }: WalletComponentProps & { open: boolean; extraWallets: ReactNode }) {
  const signInRef = useRef<SignInInterface>(null);
  const { setModalOpen, setWallet } = useWebLoginContext();
  const [password, setPassword] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);

  const appName = getConfig().appName;
  const chainId = getConfig().chainId;

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
      const wallet = new PortkeyWallet();
      wallet.setInfo({
        appName,
        chainId: chainId as ChainId,
        walletInfo: didWallet,
      });
      setWallet(wallet);
    },
    [appName, chainId, setWallet],
  );

  const onUnlock = useCallback(async () => {
    console.log(password, appName);
    const localWallet = await did.load(password, appName);
    if (!localWallet.didWallet.accountInfo.loginAccount) {
      setIsWrongPassword(true);
      return;
    }

    let caInfo = localWallet.didWallet.caInfo[chainId];
    let caHash = caInfo?.caHash;
    if (!caInfo) {
      const key = Object.keys(localWallet.didWallet.caInfo)[0];
      caHash = localWallet.didWallet.caInfo[key].caHash;
      caInfo = await did.didWallet.getHolderInfoByContract({
        caHash: caHash,
        chainId: chainId as ChainId,
      });
    }

    const didWalletInfo: DIDWalletInfo = {
      caInfo,
      pin: password,
      chainId: chainId as ChainId,
      walletInfo: localWallet.didWallet.managementAccount!.wallet as any, // TODO
      accountInfo: localWallet.didWallet.accountInfo as any,
    };
    onFinish(didWalletInfo);
    setIsWrongPassword(false);
    setPassword('');
  }, [setIsWrongPassword, onFinish, setPassword, password, chainId, appName]);

  if (PortkeyWallet.checkLocalManager(appName)) {
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
      defaultChainId={chainId as any}
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
