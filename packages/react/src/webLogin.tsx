import { NightElfProvider } from './nightElf/context';
import { PortkeySDKProvider, PortkeySDKProviderProps } from './portkey/context';
import { DiscoverProvider } from './discover/context';

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
