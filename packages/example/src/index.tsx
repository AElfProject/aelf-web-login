import React from 'react';
import { createRoot } from 'react-dom/client';
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';
import './index.css';
import './config';
import { WebLoginProvider } from 'aelf-web-login';
import { PortkeyConfigProvider } from '@portkey/did-ui-react';
import App from './App';

function Index() {
  return (
    <PortkeyConfigProvider>
      <WebLoginProvider
        extraWallets={['discover', 'elf']}
        nightElf={{
          connectEagerly: true,
          onPluginNotFound: openStore => {
            console.log(123);
            openStore();
          },
        }}
        portkey={{ autoShowUnlock: false, checkAccountInfoSync: true }}
        discover={{
          autoRequestAccount: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          onPluginNotFound: openStore => {
            console.log(234);
            openStore();
          },
        }}>
        <App />
      </WebLoginProvider>
    </PortkeyConfigProvider>
  );
}
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
);
