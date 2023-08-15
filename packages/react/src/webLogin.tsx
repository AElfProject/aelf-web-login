import { NightElfProvider } from './nightElf/context';
import { PortkeySDKProvider, PortkeySDKProviderProps } from './portkey/context';
import { DiscoverProvider } from './discover/context';
import { WebLogin } from '@aelf-web-login/core';

export class ReactWebLogin extends WebLogin {
  login(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  logout(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export type WebLoginProps = {
  portkey: Omit<PortkeySDKProviderProps, 'children'>;
  children: React.ReactNode;
};

export function WebLoginProvider(props: WebLoginProps) {
  return (
    <NightElfProvider>
      <DiscoverProvider>
        <PortkeySDKProvider {...props.portkey}>{props.children}</PortkeySDKProvider>
      </DiscoverProvider>
    </NightElfProvider>
  );
}
