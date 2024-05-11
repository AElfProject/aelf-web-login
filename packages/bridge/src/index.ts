// export * from './mountApp'
import { TChainId, WalletAdapter } from '@aelf-web-login/wallet-adapter-base';
import { Bridge } from './bridge';
import { mountApp } from './mountApp';
import { store, AppStore } from './store';
import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';
import { ConfigProvider, TDesign } from '@portkey/did-ui-react';

export interface IBaseConfig {
  chainId: TChainId;
  keyboard?: boolean;
  design?: TDesign;
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
