import { useState, useCallback } from 'react';
import { WebLoginState } from '../../constants';
import { useInterval } from 'ahooks';
import { ChainId } from '@portkey/types';
import type { IHolderInfo } from '@portkey/services';
import { DIDWalletInfo, did } from '@portkey/did-ui-react';
import useLoginState from '../../hooks/useLoginState';

export default function useAccountInfoSync(
  chainId: string,
  loginState: WebLoginState,
  shouldSync: boolean,
  didWalletInfo?: DIDWalletInfo,
) {
  const currentChainId = chainId as ChainId;
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [holderInfo, setHolderInfo] = useState<IHolderInfo>();

  useLoginState((state) => {
    if (state !== WebLoginState.logined) {
      setHolderInfo(undefined);
      setSyncCompleted(false);
    }
  });

  const checkHolderInfo = useCallback(async () => {
    if (loginState !== WebLoginState.logined) {
      setSyncCompleted(false);
      setHolderInfo(undefined);
      return;
    }
    if (!shouldSync) return;
    const holder = await did.didWallet.getHolderInfoByContract({
      chainId: currentChainId,
      caHash: didWalletInfo?.caInfo.caHash,
      // manager: did.didWallet.managementAccount!.address,
    });
    if (syncCompleted) return;
    const filteredHolders = holder.managerInfos.filter(
      (manager) => manager?.address === didWalletInfo?.walletInfo?.address,
    );
    setHolderInfo(holder);
    setSyncCompleted(filteredHolders.length > 0);
  }, [
    currentChainId,
    didWalletInfo?.caInfo.caHash,
    didWalletInfo?.walletInfo?.address,
    loginState,
    shouldSync,
    syncCompleted,
  ]);

  useInterval(checkHolderInfo, 10000, {
    immediate: true,
  });

  return {
    syncCompleted,
    holderInfo,
  };
}
