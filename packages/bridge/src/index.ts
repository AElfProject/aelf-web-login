// export * from './mountApp'
import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';
import { Bridge } from './bridge';
import { mountApp } from './mountApp';
import { store, AppStore } from './store';
import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';
import { ConfigProvider } from '@portkey/did-ui-react';

export interface IBaseConfig {
  keyboard: boolean;
}
export interface IConfigProps {
  didConfig: GlobalConfigProps;
  baseConfig: IBaseConfig;
  wallets: WalletAdapter[];
}
export interface IBridgeAPI {
  instance: Bridge;
  store: AppStore;
}
export function initBridge({ baseConfig, wallets, didConfig }: IConfigProps): IBridgeAPI {
  const bridgeInstance = new Bridge(wallets);
  ConfigProvider.setGlobalConfig(didConfig);

  mountApp(bridgeInstance, wallets, baseConfig);
  return {
    instance: bridgeInstance,
    store,
  };
}
