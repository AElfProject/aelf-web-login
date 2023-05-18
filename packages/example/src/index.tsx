import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@portkey/did-ui-react/dist/assets/index.css';
import './index.css';
import './config';
import { WebLoginProvider, useWebLogin, WebLoginState } from '@aelf-web-login/login';
import configJson from './assets/config.json';

function Usage() {
  const [result, setResult] = useState({});

  const { login, loginEagerly, logout, loginState, loginError, callContract } = useWebLogin();

  if (loginError) {
    console.error(loginError);
  }

  const onClickCall = async () => {
    try {
      const res = await callContract({
        contractAddress: configJson.tokenConverter,
        methodName: 'Buy',
        args: {
          symbol: configJson.SYMBOL,
          amount: 1,
        },
      });
      console.log(res);
      setResult(res);
    } catch (error) {
      console.log(error);
      setResult({ error: error.message });
    }
  };

  return (
    <div className="content">
      <h2>Login</h2>
      <div className="buttons">
        <div>login state: {loginState}</div>
        <div>{loginError && <div>{/* login error: {loginError.message} */}</div>}</div>
        <br />
        <button disabled={loginState !== WebLoginState.initial} onClick={login}>
          login
        </button>
        <button disabled={loginState !== WebLoginState.eagerly} onClick={loginEagerly}>
          loginEagerly
        </button>
        <button disabled={loginState !== WebLoginState.lock} onClick={login}>
          unlock
        </button>
        <button disabled={loginState !== WebLoginState.logined} onClick={logout}>
          logout
        </button>
      </div>
      <br />
      <br />
      <h2>Contract:</h2>
      <div className="contract">
        <button disabled={loginState !== WebLoginState.logined} onClick={onClickCall}>
          Call contract
        </button>
        <div>
          <h3>Result</h3>
          <code className="result">{JSON.stringify(result, null, '  ')}</code>
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
