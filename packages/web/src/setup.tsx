import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WebLoginProvider } from '@aelf-web-login/react';

function SDKRoot() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

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
      <></>
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
}
