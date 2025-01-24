import { IBridgeAPI, IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import React, { useMemo } from 'react';
import init from './init';
import { ETRANSFER_CONFIG } from './constants/config';
import { PortkeyWebWalletProvider } from '@portkey/connect-web-wallet';
import { ModalProvider } from './useModal';
import Modals from './Modals';
const HOOK_ERROR_MESSAGE =
  'Must call the provided initialization method`init` method before using hooks.';

type TWebLoginContextValue = IBridgeAPI & { extraElementInConnectModal?: React.ReactNode };

const WebLoginContext: React.Context<TWebLoginContextValue> =
  React.createContext<TWebLoginContextValue>({} as TWebLoginContextValue);

export default WebLoginContext;

export function useWebLoginContext(): TWebLoginContextValue {
  const bridgeAPI = React.useContext(WebLoginContext);

  if (!bridgeAPI) {
    throw new Error(HOOK_ERROR_MESSAGE);
  }

  return bridgeAPI;
}

export interface IWebLoginProviderProps {
  children: React.ReactNode;

  config: IConfigProps;
  extraElementInConnectModal?: React.ReactNode;
}

export const WebLoginProvider: React.FC<IWebLoginProviderProps> = ({
  children,
  config,
  extraElementInConnectModal,
}) => {
  const networkType = config.baseConfig.networkType || 'MAINNET';
  const _config = useMemo(
    () => ({
      ...ETRANSFER_CONFIG[networkType],
      ...config,
    }),
    [config, networkType],
  );
  const finalBridgeAPI: IBridgeAPI | undefined = useMemo(() => init(_config), [_config]);

  if (!finalBridgeAPI) {
    return null;
  }

  return (
    <WebLoginContext.Provider value={{ ...finalBridgeAPI, extraElementInConnectModal }}>
      <ModalProvider>
        <PortkeyWebWalletProvider
          options={{
            networkType: config.baseConfig.networkType,
            appId: config.baseConfig.appName,
            theme: config.baseConfig.theme,
            loginConfig: config.baseConfig.loginConfig,
            design: config.baseConfig.design,
          }}
        >
          <Modals />

          {children}
        </PortkeyWebWalletProvider>
      </ModalProvider>
    </WebLoginContext.Provider>
  );
};
