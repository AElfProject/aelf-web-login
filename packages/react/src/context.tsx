import { IBridgeAPI, IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import React, { useMemo } from 'react';
import init from './init';

const HOOK_ERROR_MESSAGE =
  'Must call the provided initialization method`init` method before using hooks.';

const WebLoginContext: React.Context<IBridgeAPI> = React.createContext<IBridgeAPI>(
  {} as IBridgeAPI,
);

export default WebLoginContext;

export function useWebLoginContext(): IBridgeAPI {
  const bridgeAPI = React.useContext(WebLoginContext);

  if (!bridgeAPI) {
    throw new Error(HOOK_ERROR_MESSAGE);
  }

  return bridgeAPI;
}

export interface IWebLoginProviderProps {
  children: React.ReactNode;
  /**
   * @deprecated use config instead
   */
  bridgeAPI?: IBridgeAPI;
  config: IConfigProps;
}

export const WebLoginProvider: React.FC<IWebLoginProviderProps> = ({
  children,
  bridgeAPI,
  config,
}) => {
  const finalBridgeAPI: IBridgeAPI | undefined = useMemo(
    () => bridgeAPI || (config ? init(config) : undefined),
    [bridgeAPI, config],
  );

  if (!finalBridgeAPI) {
    return null;
  }
  const { getSignIn } = finalBridgeAPI;

  return (
    <WebLoginContext.Provider value={finalBridgeAPI}>
      {getSignIn(children)}
    </WebLoginContext.Provider>
  );
};
