// export * from './mountApp'
import {
  TChainId,
  SignInDesignEnum,
  NetworkEnum,
  WalletAdapter,
} from '@aelf-web-login/wallet-adapter-base';
import { Bridge } from './bridge';
import { mountApp, unMountApp, useMountSignIn } from './mountApp';
import { store, AppStore } from './store';
import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';
import { ConfigProvider, SignInProps, ISignIn, PortkeyProvider } from '@portkey/did-ui-react';
import { RefAttributes } from 'react';
import { IConfirmLogoutDialogProps } from './ui';

type BaseConfigProviderProps = Omit<React.ComponentProps<typeof PortkeyProvider>, 'children'>;

export interface IBaseConfig {
  networkType: NetworkEnum;
  chainId: TChainId;
  sideChainId: TChainId;
  keyboard?: boolean;
  design?: SignInDesignEnum;
  iconSrcForSocialDesign?: string;
  titleForSocialDesign?: string;
  noCommonBaseModal?: boolean;
  showVconsole?: boolean;
  defaultPin?: string;
  omitTelegramScript?: boolean;
  cancelAutoLoginInTelegram?: boolean;
  enableAcceleration?: boolean;
  SignInComponent?: React.FC<SignInProps & RefAttributes<ISignIn>>;
  PortkeyProviderProps?: Partial<BaseConfigProviderProps>;
  ConfirmLogoutDialog?: React.FC<Partial<IConfirmLogoutDialogProps>>;
}
export interface IConfigProps {
  didConfig: GlobalConfigProps;
  baseConfig: IBaseConfig;
  wallets: WalletAdapter[];
}
export interface IBridgeAPI {
  instance: Bridge;
  store: AppStore;
  mountApp: () => void;
  unMountApp: () => void;
  getSignIn: (arg: React.ReactNode) => React.ReactNode;
}
export function initBridge({ baseConfig, wallets, didConfig }: IConfigProps): IBridgeAPI {
  const bridgeInstance = new Bridge(wallets, baseConfig);
  ConfigProvider.setGlobalConfig(didConfig);
  console.log('init bridge');

  // mountApp(bridgeInstance, wallets, baseConfig);
  return {
    instance: bridgeInstance,
    store,
    mountApp: mountApp.bind(null, bridgeInstance, wallets, baseConfig),
    unMountApp,
    getSignIn: useMountSignIn.bind(null, bridgeInstance, wallets, baseConfig),
  };
}

export { GuardianApprovedItem } from '@portkey/did-ui-react';

// export { demoFn } from './ui';
