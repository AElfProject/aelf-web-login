import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';
import SignInModal from './ui';
import { Bridge } from './bridge';
import { IBaseConfig } from '.';
import { PortkeyProvider } from '@portkey/did-ui-react';
import { useMemo } from 'react';

export function useMountSignIn(
  bridgeInstance: Bridge,
  wallets: WalletAdapter[],
  baseConfig: IBaseConfig,
  children: React.ReactNode,
): React.ReactNode {
  const SignInNode = useMemo(() => {
    return (
      <PortkeyProvider {...baseConfig.PortkeyProviderProps} networkType={baseConfig.networkType}>
        <SignInModal bridgeInstance={bridgeInstance} wallets={wallets} baseConfig={baseConfig} />
        {children}
      </PortkeyProvider>
    );
  }, [baseConfig, bridgeInstance, children, wallets]);
  return SignInNode;
}
