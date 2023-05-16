import React, { ReactNode, useCallback, useRef, useEffect, useState } from 'react';
import { WalletComponentProps } from '../types';
import { DIDWalletInfo, SignIn, Unlock, SignInInterface, did } from '@portkey/did-ui-react';
import { PortkeyWallet } from '../wallet';
import { useWebLoginContext } from '../context';
import { getConfig } from '../config';
import { aes } from '@portkey/utils';
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
    console.log(password, appName);
    const localWallet = await did.load(password, appName);

    // "U2FsdGVkX19EQFP8aHlVpoNOILKy6d7XnxFifvNWN9fyNahg8yER4vQaD19/tjJ7s/dIgW2tUFObr4BNAoFfQB4YYjc53yv9RzLaoif+oF0SIKSCKcCeUgTkzKA8zsGvaUctsWu4WwiqSDMl7ESAtpIkezxzvIGAeXxOlqICzpNbE/a9jzQdB0nmEVMxtXzxn++ZZMq4eih7jgff6nvilyZIHq5dkfs1vqBxPe/ybLFDwDy4RAuWRR1nFO0fMwoSgU1zrDPIcujq5v60eZ7Hl8rUry52mzIQ9RkcT1BrZ7fuBLMRvNeSOyQQ/nW+t97iGGxWvPGAdaKD+t45Omlr04apL5exGojvyiONb4pCsmLfwRPJiN4Wvz5I66sPYQ+tiqbtYhRGSo2AjNAJQny9PXwcyQFh7JnQGQy45VcOjCfvPWZ7CpeSNxnLbOR+ctC4u9yLRpTFJigi+OO/43ExNTwpFBN9b2rzBMrLUfWyRjj+5XvFbU1LiVThymHy4Jf9asPYEthSaUf0f4MbdkjJjPLoiRjY4CUTmECFnmQJwJY0TQg5lgV5jzXUcHmKgH89";
    // "U2FsdGVkX19EQFP8aHlVpoNOILKy6d7XnxFifvNWN9fyNahg8yER4vQaD19/tjJ7s/dIgW2tUFObr4BNAoFfQB4YYjc53yv9RzLaoif+oF0SIKSCKcCeUgTkzKA8zsGvaUctsWu4WwiqSDMl7ESAtpIkezxzvIGAeXxOlqICzpNbE/a9jzQdB0nmEVMxtXzxn++ZZMq4eih7jgff6nvilyZIHq5dkfs1vqBxPe/ybLFDwDy4RAuWRR1nFO0fMwoSgU1zrDPIcujq5v60eZ7Hl8rUry52mzIQ9RkcT1BrZ7fuBLMRvNeSOyQQ/nW+t97iGGxWvPGAdaKD+t45Omlr04apL5exGojvyiONb4pCsmLfwRPJiN4Wvz5I66sPYQ+tiqbtYhRGSo2AjNAJQny9PXwcyQFh7JnQGQy45VcOjCfvPWZ7CpeSNxnLbOR+ctC4u9yLRpTFJigi+OO/43ExNTwpFBN9b2rzBMrLUfWyRjj+5XvFbU1LiVThymHy4Jf9asPYEthSaUf0f4MbdkjJjPLoiRjY4CUTmECFnmQJwJY0TQg5lgV5jzXUcHmKgH89";

    const enStr = aes.encrypt('test', '888888');
    const str = aes.decrypt(enStr, '888888');
    console.log(
      str,
      aes.decrypt(
        'U2FsdGVkX19EQFP8aHlVpoNOILKy6d7XnxFifvNWN9fyNahg8yER4vQaD19/tjJ7s/dIgW2tUFObr4BNAoFfQB4YYjc53yv9RzLaoif+oF0SIKSCKcCeUgTkzKA8zsGvaUctsWu4WwiqSDMl7ESAtpIkezxzvIGAeXxOlqICzpNbE/a9jzQdB0nmEVMxtXzxn++ZZMq4eih7jgff6nvilyZIHq5dkfs1vqBxPe/ybLFDwDy4RAuWRR1nFO0fMwoSgU1zrDPIcujq5v60eZ7Hl8rUry52mzIQ9RkcT1BrZ7fuBLMRvNeSOyQQ/nW+t97iGGxWvPGAdaKD+t45Omlr04apL5exGojvyiONb4pCsmLfwRPJiN4Wvz5I66sPYQ+tiqbtYhRGSo2AjNAJQny9PXwcyQFh7JnQGQy45VcOjCfvPWZ7CpeSNxnLbOR+ctC4u9yLRpTFJigi+OO/43ExNTwpFBN9b2rzBMrLUfWyRjj+5XvFbU1LiVThymHy4Jf9asPYEthSaUf0f4MbdkjJjPLoiRjY4CUTmECFnmQJwJY0TQg5lgV5jzXUcHmKgH89',
        '111111',
      ),
    );
    console.log(localWallet);
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
      pin: password,
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
