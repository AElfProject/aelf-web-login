import { IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';
import React from 'react';

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
  bridgeAPI: IBridgeAPI;
}

export const WebLoginProvider: React.FC<IWebLoginProviderProps> = ({ children, bridgeAPI }) => {
  const { getSignIn } = bridgeAPI ?? {
    getSignIn: () => null,
  };

  if (!bridgeAPI) {
    return null;
  }
  return (
    <WebLoginContext.Provider value={bridgeAPI}>{getSignIn(children)}</WebLoginContext.Provider>
  );
};
