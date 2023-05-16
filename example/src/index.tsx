import React from 'react';
import { createRoot } from 'react-dom/client';
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/index.css';
import './index.css';
import './config';
import WebLoginProvider, { useWebLogin } from 'aelf-web-login';

function Usage() {
  const webLogin = useWebLogin();

  return (
    <div>
      <button onClick={webLogin.login}>open</button>
      <button onClick={webLogin.logout}>logout</button>
    </div>
  );
}

function App() {
  return (
    <WebLoginProvider extraWallets={['portkey', 'elf']}>
      <Usage />
    </WebLoginProvider>
  );
}
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
