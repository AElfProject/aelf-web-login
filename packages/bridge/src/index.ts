// export * from './mountApp'
import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';

import { Bridge } from './bridge';
import { mountApp } from './mountApp';

export interface IConfigProps {
  wallets: WalletAdapter[];
}
export function init({ wallets }: IConfigProps) {
  const bridgeInstance = new Bridge(wallets);
  mountApp(bridgeInstance, wallets);
  return bridgeInstance;
}
