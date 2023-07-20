import { CallContractParams, WebLoginState, useCallContract, useWebLogin } from 'aelf-web-login';
import { useState } from 'react';
import configJson from '../assets/config.json';
import configTdvwJson from '../assets/config.tdvw.json';
import { useGetAccount } from 'aelf-web-login';
import { SendOptions } from '@portkey/types';

console.log(configTdvwJson);

async function callContractWithLog<T, R>(
  callContract: (params: CallContractParams<T>, sendOptions?: SendOptions | undefined) => Promise<R>,
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
      if (res.error) {
        console.error(res.error);
        return;
      }
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
          <hr />
          <h3>{name}:</h3>
          <div>
            <button disabled={loginState !== WebLoginState.logined} onClick={onClick}>
              {name}
            </button>
            <div>
              <h4>Result</h4>
              <pre className="result">{JSON.stringify(result, null, '  ')}</pre>
            </div>
          </div>
        </>
      );
    },
  };
}

export default function CallContract() {
  const { wallet } = useWebLogin();
  console.log(wallet);
  const getAccountTDVW = useGetAccount('tDVW');
  const { callViewMethod, callSendMethod } = useCallContract();
  const { callViewMethod: callViewMethodTDVW, callSendMethod: callSendMethodTDVW } = useCallContract({
    chainId: 'tDVW',
    rpcUrl: 'https://tdvw-test-node.aelf.io',
  });

  const { callViewMethod: callViewMethodTDVV, callSendMethod: callSendMethodTDVV } = useCallContract({
    chainId: 'tDVV',
    rpcUrl: 'http://192.168.66.106:8000',
  });

  const examples = [
    useExampleCall('call getBalance', async () => {
      return callContractWithLog(callViewMethod, {
        contractAddress: configJson.multiToken,
        methodName: 'GetBalance',
        args: {
          symbol: 'ELF',
          owner: wallet.address,
        },
      });
    }),

    useExampleCall('Buy 1 WRITE', async () => {
      return await callContractWithLog(callSendMethod, {
        contractAddress: configJson.tokenConverter,
        methodName: 'Buy',
        args: {
          symbol: configJson.resourceTokens[0].symbol,
          amount: 1 * Math.pow(10, configJson.resourceTokens[0].decimals),
        },
      });
    }),

    useExampleCall('call getBalance in tDVW', async () => {
      return callContractWithLog(callViewMethodTDVW, {
        contractAddress: configTdvwJson.multiToken,
        methodName: 'GetBalance',
        args: {
          symbol: 'ELF',
          owner: await getAccountTDVW(),
        },
      });
    }),

    useExampleCall('Buy 1 WRITE in tDVW', async () => {
      return await callContractWithLog(callSendMethod, {
        contractAddress: configTdvwJson.tokenConverter,
        methodName: 'Buy',
        args: {
          symbol: configJson.resourceTokens[0].symbol,
          amount: 1 * Math.pow(10, configJson.resourceTokens[0].decimals),
        },
      });
    }),

    useExampleCall('Approve in tDVW', async () => {
      return await callContractWithLog(callSendMethodTDVW, {
        contractAddress: configTdvwJson.multiToken,
        methodName: 'Approve',
        args: {
          symbol: 'ELF',
          spender: configTdvwJson.multiToken,
          amount: '100000000',
        },
      });
    }),
  ];
  return (
    <div>
      <h2>Call Contract</h2>
      {examples.map((example, index) => {
        return <div key={example.name}>{example.render()}</div>;
      })}
    </div>
  );
}
