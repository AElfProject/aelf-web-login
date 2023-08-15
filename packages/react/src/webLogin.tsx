import { NightElfProvider } from './nightElf/context';
import { PortkeySDKProvider, PortkeySDKProviderProps } from './portkey/context';

export type WebLoginProps = {
  portkey: Omit<PortkeySDKProviderProps, 'children'>;
  children: React.ReactNode;
};

export function WebLoginProvider(props: WebLoginProps) {
  return (
    <NightElfProvider>
      <PortkeySDKProvider {...props.portkey}>{props.children}</PortkeySDKProvider>
    </NightElfProvider>
  );
}
