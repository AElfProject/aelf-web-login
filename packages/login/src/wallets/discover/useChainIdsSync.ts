import { useState, useCallback, useEffect } from 'react';
import { WebLoginState } from '../../constants';
import { useInterval } from 'ahooks';
import type { IPortkeyProvider, ChainIds, ChainId } from '@portkey/provider-types';

export default function useChainIdsSync(
  chainId: string,
  loginState: WebLoginState,
  shouldSync: boolean,
  discoverProvider?: IPortkeyProvider,
) {
  const currentChainId = chainId as ChainId;
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [chainIds, setChainIds] = useState<ChainIds>();

  const checkChainIds = useCallback(async () => {
    if (loginState !== WebLoginState.logined) {
      setSyncCompleted(false);
      setChainIds(undefined);
      return;
    }
    if (!shouldSync) return;
    if (!discoverProvider) return;
    if (syncCompleted) return;
    const chainIds = await discoverProvider.request({ method: 'chainIds' });
    setChainIds(chainIds);
    setSyncCompleted(chainIds?.includes(currentChainId));
  }, [currentChainId, discoverProvider, loginState, shouldSync, syncCompleted]);

  useEffect(() => {
    if (loginState !== WebLoginState.logined) {
      setChainIds(undefined);
      setSyncCompleted(false);
    } else {
      checkChainIds();
    }
  }, [checkChainIds, loginState]);
  useInterval(checkChainIds, 10000, {
    immediate: true,
  });

  return {
    syncCompleted,
    chainIds,
  };
}
