import { useState, useCallback } from 'react';
import { WebLoginState } from '../constants';
import { useWebLogin } from '../context';
import { useInterval } from 'ahooks';
import { ChainId } from '@portkey/types';
import type { GetCAHolderByManagerResult } from '@portkey/services';
import { did } from '@portkey/did-ui-react';
import { getConfig } from '../config';

export default function useAccountInfoSync(chainId: string | undefined = undefined) {
  const currentChainId = (chainId || getConfig().chainId) as ChainId;
  const { loginState } = useWebLogin();
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [holderInfos, setHolderInfos] = useState<GetCAHolderByManagerResult>([]);

  const checkHolderInfo = useCallback(async () => {
    if (loginState !== WebLoginState.logined) return;
    if (holderInfos.length !== 0) return;
    const holders = (await did.getHolderInfo({
      chainId: currentChainId,
      // manager: did.didWallet.managementAccount!.address,
    })) as any as GetCAHolderByManagerResult;
    if (holders.length === 0) return;
    setHolderInfos(holders);
    setSyncCompleted(true);
  }, [currentChainId, holderInfos.length, loginState]);

  const clearInterval = useInterval(checkHolderInfo, 1000, {
    immediate: true,
  });

  if (syncCompleted) {
    clearInterval();
  }

  return {
    syncCompleted,
    holderInfos,
  };
}
