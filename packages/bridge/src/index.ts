import {
  TChainId,
  SignInDesignEnum,
  NetworkEnum,
  WalletAdapter,
} from '@aelf-web-login/wallet-adapter-base';
import { Bridge } from './bridge';
import { store, AppStore } from './store';
import { ILoginConfig, ThemeType } from '@portkey/connect-web-wallet';

export interface IBaseConfig {
  networkType: NetworkEnum;
  appName: string;
  chainId: TChainId;
  sideChainId: TChainId;
  design?: SignInDesignEnum;
  loginConfig?: ILoginConfig;
  theme?: ThemeType;
  showVconsole?: boolean;
  omitTelegramScript?: boolean;
  enableAcceleration?: boolean;
}
export interface IConfigProps {
  baseConfig: IBaseConfig;
  wallets: WalletAdapter[];
}
export interface IBridgeAPI {
  instance: Bridge;
  store: AppStore;
}
export function initBridge({ baseConfig, wallets }: IConfigProps): IBridgeAPI {
  const bridgeInstance = new Bridge(wallets, baseConfig);
  console.log('init bridge');

  return {
    instance: bridgeInstance,
    store,
  };
}
