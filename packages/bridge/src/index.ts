// export * from './mountApp'
import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';

import { Bridge } from './bridge';
import { mountApp } from './mountApp';
import { store, AppStore } from './store';

export interface IConfigProps {
  wallets: WalletAdapter[];
}
export interface IBridgeAPI {
  instance: Bridge;
  store: AppStore;
}
export function initBridge({ wallets }: IConfigProps): IBridgeAPI {
  const bridgeInstance = new Bridge(wallets);
  mountApp(bridgeInstance, wallets);
  return {
    instance: bridgeInstance,
    store,
  };
}
