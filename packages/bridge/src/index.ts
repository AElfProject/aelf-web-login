import {
  TChainId,
  SignInDesignEnum,
  NetworkEnum,
  WalletAdapter,
} from '@aelf-web-login/wallet-adapter-base';
import { Bridge } from './bridge';
import { useMountSignIn } from './mountApp';
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
  getSignIn: (arg: React.ReactNode) => React.ReactNode;
}
export function initBridge({ baseConfig, wallets, didConfig }: IConfigProps): IBridgeAPI {
  const bridgeInstance = new Bridge(wallets, baseConfig);
  ConfigProvider.setGlobalConfig(didConfig);
  console.log('init bridge');

  return {
    instance: bridgeInstance,
    store,
    getSignIn: useMountSignIn.bind(null, bridgeInstance, wallets, baseConfig),
  };
}

export * as PortkeyDid from '@portkey/did-ui-react';
export type { GuardianApprovedItem } from '@portkey/did-ui-react';

// export { demoFn } from './ui';
