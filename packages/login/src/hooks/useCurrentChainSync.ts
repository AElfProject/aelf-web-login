import { useCallback } from 'react';
import { MethodsWallet, ChainId } from '@portkey/provider-types';
import { useWebLogin } from '../context';
import { WalletType, WebLoginState } from '../constants';
import detectDiscoverProvider from '../wallets/discover/detectProvider';
import { useComponentFlex } from '../utils/getDidAndVersion';
import type { IHolderInfo } from '@portkey/services';
import type { IHolderInfo as IHolderInfoV1 } from '@portkey-v1/services';

export const useCurrentChainSync = (chainId: ChainId) => {
  const { loginState, walletType, wallet } = useWebLogin();
  const { did } = useComponentFlex();
  return useCallback(async () => {
    // test if logined
    if (loginState !== WebLoginState.logined) {
      throw new Error('Please login first');
    }
    if (walletType === WalletType.unknown) {
      throw new Error(`Invalid wallet type: ${walletType}`);
    }
    switch (walletType) {
      case WalletType.elf:
        // nightelf don't diff chainId
        return true;
      case WalletType.discover: {
        const provider = await detectDiscoverProvider();
        const status = await provider?.request({
          method: MethodsWallet.GET_WALLET_MANAGER_SYNC_STATUS,
          payload: { chainId },
        });
        if (status) {
          return true;
        } else {
          return false;
        }
      }
      case WalletType.portkey: {
        return did.checkManagerIsExist({
          chainId,
          caHash: wallet.portkeyInfo?.caInfo?.caHash as string,
          managementAddress: wallet.portkeyInfo?.walletInfo?.address,
        });
      }
    }
  }, [loginState, walletType, chainId]);
};
