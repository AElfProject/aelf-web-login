import { useCallback } from 'react';
import { WalletType, WebLoginState } from '../constants';
import { useWebLogin } from '../context';
import { ChainId } from '@portkey/provider-types';
import { WebLoginInstance } from '../injectPortkey';

export default function useGetAccount(chainId: string) {
  const { loginState, walletType, wallet } = useWebLogin();
  const portkeyInstance = new WebLoginInstance().getPortkey();
  return useCallback(async () => {
    if (loginState !== WebLoginState.logined) {
      throw new Error('Please login first');
    }
    if (walletType === WalletType.unknown) {
      throw new Error(`Invalid wallet type: ${walletType}`);
    }
    switch (walletType) {
      case WalletType.portkey: {
        let accounts = wallet.portkeyInfo!.accounts;
        if (!accounts || !accounts[chainId]) {
          const caInfo = await portkeyInstance.did.didWallet.getHolderInfoByContract({
            caHash: wallet.portkeyInfo!.caInfo.caHash,
            chainId: chainId as ChainId,
          });
          wallet.portkeyInfo!.accounts = {
            ...accounts,
            [chainId]: caInfo.caAddress,
          };
          accounts = wallet.portkeyInfo!.accounts;
        }
        if (!accounts[chainId]) {
          throw new Error(`Account not found in chain: ${chainId}`);
        }
        return accounts[chainId];
      }
    }
  }, [chainId, loginState, portkeyInstance.did.didWallet, wallet.portkeyInfo, walletType]);
}
