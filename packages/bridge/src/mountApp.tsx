import React from 'react';
import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';
import { createRoot } from 'react-dom/client';
import SignInModal from './ui';
import { Bridge } from './bridge';
import { IBaseConfig } from '.';

export function mountApp(
  bridgeInstance: Bridge,
  wallets: WalletAdapter[],
  baseConfig: IBaseConfig,
) {
  if (typeof window === 'undefined') {
    return;
  }
  console.log('mountApp');
  const containerElementQuery = 'body';
  const containerElement = document.querySelector(containerElementQuery);
  if (!containerElement) {
    throw new Error(`Element with query ${containerElementQuery} does not exist.`);
  }

  const SignInWrapperDom = document.createElement('div');
  SignInWrapperDom.setAttribute('id', 'sign-in-wrapper');
  const root = createRoot(SignInWrapperDom);
  root.render(
    <SignInModal bridgeInstance={bridgeInstance} wallets={wallets} baseConfig={baseConfig} />,
  );
  containerElement.appendChild(SignInWrapperDom);
}
