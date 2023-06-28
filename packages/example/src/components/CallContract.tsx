import { CallContractParams, WebLoginState, useCallContract, useWebLogin } from 'aelf-web-login';
import { useState } from 'react';
import configJson from '../assets/config.json';

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
  const { callViewMethod, callSendMethod } = useCallContract();

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
