import { ReactNode } from 'react';
import { IRequestDefaults, IStorageSuite } from '@portkey/types';
import { IStorageSuite as IStorageSuiteV1 } from '@portkey-v1/types';
import { NetworkType } from '@portkey/provider-types';
import { GlobalConfigProps as GlobalConfigPropsV1 } from '@portkey-v1/did-ui-react/dist/_types/src/components/config-provider/types';
import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';
import { EventEmitter } from 'ahooks/lib/useEventEmitter';
import { PortkeyDidV1, PortkeyDid, WEB_LOGIN_VERSION } from './index';

// copy from @aelf-react/core, cause it's not exported
export type AelfNode = {
  rpcUrl: string;
  chainId: string;
};
export type AElfReactProviderProps = {
  children: ReactNode;
  appName: string;
  nodes?: {
    [key: string]: AelfNode;
  };
};
// export interface IVersion {
//   portkey?: number;
//   discover?: number;
// }
export type WebLoginConfig = {
  ifShowV2: boolean;
  appName: string;
  chainId: string;
  defaultRpcUrl: string;
  networkType: NetworkType;
  portkey: (GlobalConfigProps | GlobalConfigPropsV1) & {
    useLocalStorage?: boolean;
    portkeyV2?: {
      requestDefaults: IRequestDefaults;
    };
  };
  aelfReact: Omit<AElfReactProviderProps, 'children'>;
};

export class Store implements IStorageSuite, IStorageSuiteV1 {
  async getItem(key: string) {
    return localStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    return localStorage.removeItem(key);
  }
}

let globalConfig: WebLoginConfig;
export const event$ = new EventEmitter();

export function setGlobalConfig(config: WebLoginConfig) {
  const version = localStorage.getItem(WEB_LOGIN_VERSION) || (config.ifShowV2 ? '2' : '1');
  globalConfig = config;
  if (config.portkey.useLocalStorage) {
    config.portkey.storageMethod = new Store();
  }
  // init version according to config ifShowV2
  if (version === '1') {
    console.log(config.portkey, 'setGlobalConfig1111');
    PortkeyDid.ConfigProvider.setGlobalConfig(config.portkey);
  } else {
    console.log(
      {
        ...config.portkey,
        ...config.portkey.portkeyV2,
      },
      'setGlobalConfig2222',
    );
    PortkeyDidV1.ConfigProvider.setGlobalConfig({
      ...config.portkey,
      ...config.portkey.portkeyV2,
    });
  }
}

export function getConfig() {
  return globalConfig;
}
