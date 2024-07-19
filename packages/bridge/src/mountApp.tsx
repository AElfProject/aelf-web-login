import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';
import { createRoot } from 'react-dom/client';
import SignInModal from './ui';
import { Bridge } from './bridge';
import { IBaseConfig } from '.';
import { PortkeyProvider } from '@portkey/did-ui-react';
import { useMemo } from 'react';

export function mountApp(
  bridgeInstance: Bridge,
  wallets: WalletAdapter[],
  baseConfig: IBaseConfig,
) {
  if (typeof window === 'undefined') {
    return;
  }
  console.log('mountApp--');
  const containerElementQuery = 'body';
  const containerElement = document.querySelector(containerElementQuery);
  if (!containerElement) {
    throw new Error(`Element with query ${containerElementQuery} does not exist.`);
  }

  const SignInWrapperDom = document.createElement('div');
  SignInWrapperDom.setAttribute('id', 'sign-in-wrapper');
  const root = createRoot(SignInWrapperDom);
  root.render(
    <PortkeyProvider {...baseConfig.PortkeyProviderProps} networkType={baseConfig.networkType}>
      <SignInModal bridgeInstance={bridgeInstance} wallets={wallets} baseConfig={baseConfig} />
    </PortkeyProvider>,
  );
  containerElement.appendChild(SignInWrapperDom);
}

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

export function unMountApp() {
  if (typeof window === 'undefined') {
    return;
  }
  const SignInWrapperDom = document.querySelector('#sign-in-wrapper');
  if (!SignInWrapperDom) {
    return;
  }
  document.body.removeChild(SignInWrapperDom);
}
