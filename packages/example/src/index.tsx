import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/antd.css';
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';
import './index.css';
import './config';
import App from './App';
import { Button } from 'antd';
import { GoogleLoginProcessor, PortkeySDK, PortkeySDKProvider } from 'aelf-web-login';

function Index() {
  return (
    <PortkeySDKProvider networkType="TESTNET" chainType="aelf">
      <App />
    </PortkeySDKProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
);
