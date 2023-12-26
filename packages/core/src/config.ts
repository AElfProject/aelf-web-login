import { NetworkType } from '@portkey/provider-types';
import { IStorageSuite } from '@portkey/types';
import { WebLoginInstance } from './injectPortkey';

export type WebLoginConfig = {
  appName: string;
  chainId: string;
  defaultRpcUrl: string;
  networkType: NetworkType;
  portkey: any;
};
let globalConfig: WebLoginConfig;

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

export function setGlobalConfig(config: WebLoginConfig) {
  globalConfig = config;
  if (config.portkey.useLocalStorage) {
    config.portkey.storageMethod = new Store();
  }
  const ConfigProvider = new WebLoginInstance().getPortkey().ConfigProvider;

  ConfigProvider.setGlobalConfig(config.portkey);
}

export function getConfig() {
  return globalConfig;
}
