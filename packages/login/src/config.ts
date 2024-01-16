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
interface IVersion {
  portkey?: number;
  discover?: number;
}
export type WebLoginConfig = {
  version?: IVersion;
  appName: string;
  chainId: string;
  defaultRpcUrl: string;
  networkType: NetworkType;
  portkey: (GlobalConfigProps | GlobalConfigPropsV1) & { useLocalStorage?: boolean };
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
  // default version 2
  (config.version?.portkey === 1 ? PortkeyDidV1.ConfigProvider : PortkeyDid.ConfigProvider).setGlobalConfig(
    config.portkey,
  );
  event$.emit(globalConfig);
}

export function getConfig() {
  return globalConfig;
}
