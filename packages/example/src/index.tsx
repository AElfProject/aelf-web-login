import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@portkey/did-ui-react/dist/assets/index.css';
import './index.css';
import './config';
import { WebLoginProvider, useWebLogin, useWallet, useCallContract } from '@aelf-web-login/login';

function Usage() {
  const [result, setResult] = useState({});

  const webLogin = useWebLogin();
  const wallet = useWallet();
  const callContract = useCallContract('a', '');

  console.log(wallet);

  const onClickCall = async () => {
    try {
      const res = await callContract({});
      setResult(res);
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  return (
    <div>
      <div>
        <button onClick={webLogin.login}>open</button>
        <button onClick={webLogin.logout}>logout</button>
      </div>
      <div>
        <button onClick={onClickCall}>Call contract</button>
        <div>
          <h3>Result</h3>
          <div>{JSON.stringify(result, null, '  ')}</div>
        </div>
      </div>
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
