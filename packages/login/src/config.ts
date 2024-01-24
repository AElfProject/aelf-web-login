import { ReactNode } from 'react';
import { IStorageSuite } from '@portkey/types';
import { IStorageSuite as IStorageSuiteV1 } from '@portkey-v1/types';
import { NetworkType } from '@portkey/provider-types';
import { GlobalConfigProps as GlobalConfigPropsV1 } from '@portkey-v1/did-ui-react/dist/_types/src/components/config-provider/types';
import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';
import { EventEmitter } from 'ahooks/lib/useEventEmitter';
import { PortkeyDidV1, PortkeyDid } from './index';

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
export type WebLoginConfig = {
  onlyShowV2?: boolean;
  appName: string;
  chainId: string;
  defaultRpcUrl: string;
  networkType: 'MAIN' | 'TESTNET';
  portkey: GlobalConfigPropsV1 & {
    useLocalStorage?: boolean;
  };
  portkeyV2?: GlobalConfigProps & {
    useLocalStorage?: boolean;
    networkType: NetworkType;
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
  globalConfig = config;
  if (config.portkey.useLocalStorage) {
    config.portkey.storageMethod = new Store();
  }
  // v1 v2 set config at the same time
  PortkeyDidV1.ConfigProvider.setGlobalConfig(config.portkey);
  PortkeyDid.ConfigProvider.setGlobalConfig({
    ...config.portkey,
    ...config.portkeyV2,
  });
}

export function getConfig() {
  return globalConfig;
}
