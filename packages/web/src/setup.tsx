import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WebLoginProvider, useWebLogin } from '@aelf-web-login/react';
import { SDKDelegate } from './sdk';

const delegate: SDKDelegate = {} as any;

function SDKContent() {
  const webLogin = useWebLogin();
  delegate.webLogin = webLogin;
  return <></>;
}

function SDKRoot() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  delegate.setTheme = setTheme;

  return (
    <WebLoginProvider
      portkey={{
        appName: 'WebLogin.example',
        networkType: 'TESTNET',
        chainType: 'aelf',
        defaultChainId: 'AELF',
        uiType: 'Modal',
        design: 'Web2Design',
        theme,
      }}>
      <SDKContent />
    </WebLoginProvider>
  );
}

export default function setup() {
  const container = document.createElement('div');
  container.id = 'aelf-web-login-root';
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <SDKRoot />
    </React.StrictMode>,
  );
  return delegate;
}
