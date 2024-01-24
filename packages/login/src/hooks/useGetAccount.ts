import { useCallback } from 'react';
import { WEB_LOGIN_VERSION, WalletType, WebLoginState } from '../constants';
import { useWebLogin } from '../context';
import { ChainId } from '@portkey/provider-types';
import { did } from '@portkey/did-ui-react';
import { did as didV1 } from '@portkey-v1/did-ui-react';
export default function useGetAccount(chainId: string) {
  const { loginState, walletType, wallet } = useWebLogin();
  return useCallback(async () => {
    if (loginState !== WebLoginState.logined) {
      throw new Error('Please login first');
    }
    if (walletType === WalletType.unknown) {
      throw new Error(`Invalid wallet type: ${walletType}`);
    }
    switch (walletType) {
      case WalletType.elf:
        return wallet.address;
      case WalletType.discover: {
        const chainIdTyped = chainId as ChainId;
        let accounts = wallet.discoverInfo?.accounts;
        if (!accounts || !accounts[chainIdTyped] || accounts![chainIdTyped]!.length === 0) {
          const provider = await wallet.discoverInfo?.provider;
          if (!provider) {
            throw new Error('Discover provider is null');
          }
          accounts = await provider.request({ method: 'accounts' });
          if (!accounts || !accounts[chainIdTyped] || accounts![chainIdTyped]!.length === 0) {
            throw new Error(`Account not found in chain: ${chainIdTyped}`);
          }
        }
        return accounts![chainIdTyped]![0];
      }
      case WalletType.portkey: {
        let accounts = wallet.portkeyInfo!.accounts;
        const version = localStorage.getItem(WEB_LOGIN_VERSION);
        if (!accounts || !accounts[chainId]) {
          const caInfo = await (version === 'v1' ? didV1 : did).didWallet.getHolderInfoByContract({
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
  }, [
    chainId,
    loginState,
    wallet.address,
    wallet.discoverInfo?.accounts,
    wallet.discoverInfo?.provider,
    wallet.portkeyInfo,
    walletType,
  ]);
}
