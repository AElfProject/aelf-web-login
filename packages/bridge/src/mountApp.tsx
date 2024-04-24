import React from 'react';
import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';
import { createRoot } from 'react-dom/client';

import { DemoButton } from './ui';

export function mountApp(bridgeInstance: any, wallets: WalletAdapter[]) {
  if (typeof window === 'undefined') {
    return;
  }
  // TODO: Can be passed from the configuration
  const containerElementQuery = 'body';
  const containerElement = document.querySelector(containerElementQuery);
  if (!containerElement) {
    throw new Error(`Element with query ${containerElementQuery} does not exist.`);
  }
  const SignInWrapperDom = document.createElement('div');
  SignInWrapperDom.setAttribute('id', 'sign-in-wrapper');
  const root = createRoot(SignInWrapperDom);
  root.render(<DemoButton bridgeInstance={bridgeInstance} wallets={wallets} />);
  containerElement.appendChild(SignInWrapperDom);
}
