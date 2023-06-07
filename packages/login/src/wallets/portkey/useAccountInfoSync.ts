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
  const [holderInfos, setHolderInfos] = useState<IHolderInfo>();

  useLoginState((state) => {
    if (state !== WebLoginState.logined) {
      setHolderInfos(undefined);
      setSyncCompleted(false);
    }
  });

  const checkHolderInfo = useCallback(async () => {
    if (!shouldSync) return;
    if (loginState !== WebLoginState.logined) return;
    const holders = await did.didWallet.getHolderInfoByContract({
      chainId: currentChainId,
      caHash: didWalletInfo?.caInfo.caHash,
      // manager: did.didWallet.managementAccount!.address,
    });
    if (syncCompleted) return;
    const filteredHolders = holders.managerInfos.filter(
      (manager) => manager?.address === didWalletInfo?.walletInfo?.address,
    );
    setHolderInfos(holders);
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
    holderInfos,
  };
}
