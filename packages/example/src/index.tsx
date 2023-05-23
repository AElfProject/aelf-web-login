import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';
import './index.css';
import './config';
import { WebLoginProvider, useWebLogin, WebLoginState } from 'aelf-web-login';
import configJson from './assets/config.json';

function Usage() {
  const [result, setResult] = useState({});
  const [signatureResult, setSignatureResult] = useState({} as any);

  const { wallet, login, loginEagerly, logout, loginState, loginError, callContract, getSignature } = useWebLogin();

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

  const rand16Num = (len = 0) => {
    const result = [];
    for (let i = 0; i < len; i += 1) {
      result.push('0123456789abcdef'.charAt(Math.floor(Math.random() * 16)));
    }
    return result.join('');
  };

  const onClickSignature = async () => {
    try {
      const res = await getSignature({
        address: wallet.address,
        appName: 'example',
        hexToBeSign: rand16Num(32),
      });
      setSignatureResult(res);
    } catch (error) {
      console.log(error);
      setSignatureResult({ error: error.message });
    }
  };

  return (
    <div className="content">
      <h2>Login</h2>
      <div className="buttons">
        <div>wallet: {wallet.address}</div>
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
          <pre className="result">{JSON.stringify(result, null, '  ')}</pre>
        </div>
      </div>

      <h2>getSignature:</h2>
      <div className="signature">
        <button disabled={loginState !== WebLoginState.logined} onClick={onClickSignature}>
          getSignature
        </button>
        <div>
          <h3>Result</h3>
          <pre className="result">{JSON.stringify(signatureResult, null, '  ')}</pre>
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
