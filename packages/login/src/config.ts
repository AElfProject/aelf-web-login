import { ReactNode } from 'react';
import { ConfigProvider as ConfigProviderV2 } from '@portkey/did-ui-react';
import { ConfigProvider } from '@portkey-v1/did-ui-react';
import { IStorageSuite } from '@portkey/types';
import { NetworkType } from '@portkey/provider-types';
// import type { AElfReactProviderProps } from '@aelf-react/types';
import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';
import { EventEmitter } from 'ahooks/lib/useEventEmitter';
import { PortkeyDidV1, PortkeyDidV2 } from './index';
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
  version?: string;
  appName: string;
  chainId: string;
  defaultRpcUrl: string;
  networkType: NetworkType;
  portkey: GlobalConfigProps & { useLocalStorage?: boolean };
  aelfReact: Omit<AElfReactProviderProps, 'children'>;
};

export class Store implements IStorageSuite {
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
  (config.version === '2' ? PortkeyDidV2.ConfigProvider : PortkeyDidV1.ConfigProvider).setGlobalConfig(config.portkey);
  event$.emit(globalConfig);
}

export function getConfig() {
  return globalConfig;
}
