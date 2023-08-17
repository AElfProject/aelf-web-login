import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WebLoginProvider } from '@aelf-web-login/react';
import { Switch } from 'antd';
import 'antd/dist/antd.css';
import '@portkey/did-ui-react/dist/assets/index.css';
import '@aelf-web-login/react/dist/assets/index.css';
import './index.css';
import './config';
import App from './App';

function Index() {
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
      <App />
      <Switch
        className="app-theme-switch"
        checkedChildren="dark"
        unCheckedChildren="dark"
        onChange={checked => setTheme(checked ? 'dark' : 'light')}
      />
    </WebLoginProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
);
