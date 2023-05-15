import { ReactNode } from 'react';
import { ConfigProvider } from '@portkey/did-ui-react';
// import type { AElfReactProviderProps } from '@aelf-react/types';
import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';

// copy from @aelf-react/core, cause it's not exported
export declare type AelfNode = {
  rpcUrl: string;
  chainId: string;
};
export interface AElfReactProviderProps {
  children: ReactNode;
  appName: string;
  nodes?: {
    [key: string]: AelfNode;
  };
}

export type WebLoginConfig = {
  portkey: GlobalConfigProps;
  aelfReact: Omit<AElfReactProviderProps, 'children'>;
};

let globalConfig: WebLoginConfig;

export function setGlobalConfig(config: WebLoginConfig) {
  globalConfig = config;
  ConfigProvider.setGlobalConfig(config.portkey);
}

export function getConfig() {
  return globalConfig;
}
