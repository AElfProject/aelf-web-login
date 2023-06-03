import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';
import './index.css';
import './config';
import { WebLoginProvider, useWebLogin, WebLoginState, useLoginState } from 'aelf-web-login';
import configJson from './assets/config.json';
import { CallContractParams } from 'aelf-web-login/dist/_types/src/wallets/types';

async function callContractWithLog<T, R>(
  callContract: (params: CallContractParams<T>) => Promise<R>,
  params: CallContractParams<T>,
): Promise<R> {
  console.log('call', params);
  const res = await callContract(params);
  console.log('res', res);
  return res;
}

function useExampleCall(name: string, func: () => any) {
  const [result, setResult] = useState({});
  const { loginState } = useWebLogin();

  const onClick = async () => {
    try {
      const res = await func();
      console.log(name, 'res', res);
      setResult(res);
    } catch (error) {
      console.log(error);
      setResult({ error: error.message });
    }
  };

  return {
    name,
    render: () => {
      return (
        <>
          <h2>{name}:</h2>
          <div>
            <button disabled={loginState !== WebLoginState.logined} onClick={onClick}>
              {name}
            </button>
            <div>
              <h3>Result</h3>
              <pre className="result">{JSON.stringify(result, null, '  ')}</pre>
            </div>
          </div>
        </>
      );
    },
  };
}

function Usage() {
  const { wallet, login, loginEagerly, logout, loginState, loginError, callContract, getSignature } = useWebLogin();

  useLoginState(state => console.log(state));

  const examples = [
    useExampleCall('callContract', async () => {
      return await callContractWithLog(callContract, {
        contractAddress: configJson.tokenConverter,
        methodName: 'Buy',
        args: {
          symbol: configJson.resourceTokens[0].symbol,
          amount: 10 * configJson.resourceTokens[0].decimals,
        },
      });
    }),
    useExampleCall('getSignature', async () => {
      return await getSignature({
        address: wallet.address,
        appName: 'example',
        hexToBeSign: '0x' + '0123456789abcdef'.repeat(32),
      });
    }),
    useExampleCall('fetchProfit', async () => {
      const contractAddress = configJson.profitContractAddr;
      const res = [];
      for (var item of configJson.schemeIds) {
        const itemRes = await callContract({
          contractAddress,
          methodName: 'GetProfitsMap',
          args: {
            beneficiary: wallet.address,
            schemeId: item.schemeId,
          },
        });
        res.push(itemRes);
      }
      return res;
    }),
    useExampleCall('AnnounceElection', async () => {
      return await callContractWithLog(callContract, {
        contractAddress: 'NrVf8B7XUduXn1oGHZeF1YANFXEXAhvCymz2WPyKZt4DE2zSg',
        methodName: 'AnnounceElection',
        args: 'ELF_2vLuU4Xi59xz6QkjdmspGHqeMxbb75ahUXZc1wXzbZdLEGdpuv_AELF',
      });
    }),
    useExampleCall('GetCandidateInformation', async () => {
      return await callContractWithLog(callContract, {
        contractAddress: 'NrVf8B7XUduXn1oGHZeF1YANFXEXAhvCymz2WPyKZt4DE2zSg',
        methodName: 'Vote',
        args: {
          candidatePubkey:
            '047794e5b424177bf03f9d5e541e7bda28056209d814c68aed2670e46d963c85d04da5f69ef82458e86174890743985e297843485b10d0295fc28b8853355cfb8b',
          amount: 100000000,
          endTimestamp: {
            seconds: 1714533239,
            nanos: 58000000,
          },
        },
      });
    }),
  ];

  if (loginError) {
    console.error(loginError);
  }

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
      {examples.map((example, index) => {
        return <div key={example.name}>{example.render()}</div>;
      })}
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
