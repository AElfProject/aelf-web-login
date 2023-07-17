import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';
import './index.css';
import './config';
import { WebLoginProvider } from 'aelf-web-login';
import { PortkeyConfigProvider, SignIn } from '@portkey/did-ui-react';
import App from './App';
import { SignInProps } from '@portkey/did-ui-react/dist/_types/src/components/SignIn';
import { createPortal } from 'react-dom';

// const SignInProxy = React.forwardRef(function SignInProxy(props: SignInProps, ref: React.Ref<any>) {
//   const [renderRoot, setRenderRoot] = React.useState<HTMLElement>();
//   useEffect(() => {
//     const container = document.createElement('div');
//     container.id = 'sign-in-container';
//     document.body.appendChild(container);
//     setRenderRoot(container);
//   }, []);
//   if (!renderRoot) {
//     return <></>;
//   }
//   return createPortal(<SignIn ref={ref} {...props} uiType="Full" />, renderRoot!);
// });

function Index() {
  return (
    <PortkeyConfigProvider>
      <WebLoginProvider
        extraWallets={['discover', 'elf']}
        nightElf={{
          connectEagerly: true,
          useMultiChain: true,
          onPluginNotFound: openStore => {
            console.log(123);
            openStore();
          },
        }}
        portkey={{
          autoShowUnlock: false,
          checkAccountInfoSync: true,
          // SignInComponent: SignInProxy,
        }}
        discover={{
          autoRequestAccount: false,
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
