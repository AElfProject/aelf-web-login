import React, { createContext, useContext, useMemo } from 'react';
import { NightElfProvider, useNightElf } from './nightElf/context';
import { PortkeySDKProvider, PortkeySDKProviderProps, usePortkeyUISDK } from './portkey/context';
import { DiscoverProvider, useDiscover } from './discover/context';
import { ReactWebLogin } from './webLogin';

type WebLoginContextType = {
  webLogin: ReactWebLogin;
};

const WebLoginContext = createContext<WebLoginContextType>({} as WebLoginContextType);

export function useWebLogin() {
  return useContext(WebLoginContext).webLogin;
}

export type WebLoginProps = {
  portkey: Omit<PortkeySDKProviderProps, 'children'>;
  children: React.ReactNode;
};

export function WebLoginContextWrapper({ children }: { children: React.ReactNode }) {
  const portkeySDK = usePortkeyUISDK();
  const nightElf = useNightElf();
  const discover = useDiscover();
  const webLogin = useMemo(() => {
    return new ReactWebLogin({ portkeySDK, nightElf, discover });
  }, [portkeySDK, nightElf, discover]);
  return <WebLoginContext.Provider value={{ webLogin }}>{children}</WebLoginContext.Provider>;
}

export function WebLoginProvider(props: WebLoginProps) {
  return (
    <NightElfProvider>
      <DiscoverProvider>
        <PortkeySDKProvider {...props.portkey}>
          <WebLoginContextWrapper>{props.children}</WebLoginContextWrapper>
        </PortkeySDKProvider>
      </DiscoverProvider>
    </NightElfProvider>
  );
}
