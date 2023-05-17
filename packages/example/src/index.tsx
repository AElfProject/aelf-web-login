import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@portkey/did-ui-react/dist/assets/index.css';
import './index.css';
import './config';
import { WebLoginProvider, useWebLogin, useWallet, useCallContract } from '@aelf-web-login/login';
import configJson from './assets/config.json';
import { WebLoginState } from '@aelf-web-login/login/dist/_types/src/types';

function Usage() {
  const [result, setResult] = useState({});

  const { login, loginEagerly, logout, loginState, loginError } = useWebLogin();
  const wallet = useWallet();
  const callContract = useCallContract(configJson.tokenConverter, 'Buy');

  console.log(wallet);

  const onClickCall = async () => {
    try {
      const res = await callContract({
        symbol: configJson.SYMBOL,
        amount: 1,
      });
      console.log(res);
      setResult(res);
    } catch (error) {
      console.log(error);
      setResult({ error: error.message });
    }
  };

  return (
    <div>
      <div>
        <button disabled={loginState === WebLoginState.eagerly} onClick={loginEagerly}>
          loginEagerly
        </button>
        <button disabled={loginState === WebLoginState.initial} onClick={login}>
          login
        </button>
        <button disabled={loginState === WebLoginState.lock} onClick={login}>
          unlock
        </button>
        <button disabled={loginState === WebLoginState.login} onClick={logout}>
          logout
        </button>

        <div>{loginState === WebLoginState.logining && <div>logining...</div>}</div>
        <div>
          {loginError && (
            <div>
              login error: {loginError} {loginError.message}
            </div>
          )}
        </div>
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
    <WebLoginProvider extraWallets={['portkey', 'elf']} connectEagerly autoShowUnlock={false}>
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
