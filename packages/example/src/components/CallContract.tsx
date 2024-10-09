import {
  CallContractParams,
  IMultiTransactionParams,
  WebLoginState,
  useCallContract,
  useCurrentChainSync,
  useWebLogin,
} from 'aelf-web-login';
import { useState } from 'react';
import configJson from '../assets/config.json';
import configTdvwJson from '../assets/config.tdvw.json';
import { useGetAccount } from 'aelf-web-login';
import { SendOptions } from '@portkey/types';
import { SendOptions as SendOptionsV1 } from '@portkey-v1/types';

async function callContractWithLog<T, R>(
  callContract: (params: CallContractParams<T>, sendOptions?: SendOptions | SendOptionsV1 | undefined) => Promise<R>,
  params: CallContractParams<T>,
): Promise<R> {
  console.log('call', params);
  const res = await callContract(params);
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
            {name === 'Approve in AELF' ? (
              // <PortkeyAssetProvider originChainId={'AELF'}>
              <button disabled={loginState !== WebLoginState.logined} onClick={onClick}>
                {name}
              </button>
            ) : (
              // </PortkeyAssetProvider>
              <button disabled={loginState !== WebLoginState.logined} onClick={onClick}>
                {name}
              </button>
            )}
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
  const { wallet, callContract, version } = useWebLogin();
  const getAccountTDVW = useGetAccount('tDVW');
  const getCurrentChainIdSync = useCurrentChainSync('tDVW');
  const { callViewMethod, callSendMethod, sendMultiTransaction } = useCallContract();
  const { callViewMethod: callViewMethodAELF, callSendMethod: callSendMethodAELF } = useCallContract({
    chainId: 'AELF',
    rpcUrl: 'https://aelf-test-node.aelf.io',
  });
  const { callViewMethod: callViewMethodTDVW, callSendMethod: callSendMethodTDVW } = useCallContract({
    chainId: 'tDVW',
    rpcUrl: 'https://tdvw-test-node.aelf.io',
  });

  interface IParmsItem {
    caHash: string;
    symbol: string;
    amount: string;
    to: string;
  }

  const paramsForMuti: IMultiTransactionParams<IParmsItem> = {
    multiChainInfo: {
      AELF: {
        chainUrl: 'https://aelf-test-node.aelf.io/',
        contractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      },
      tDVW: {
        chainUrl: 'https://tdvw-test-node.aelf.io/',
        contractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      },
    },
    gatewayUrl: 'https://gateway-test.aelf.io',
    chainId: 'tDVW',
    params: {
      AELF: {
        method: 'ManagerTransfer',
        params: {
          caHash: wallet?.portkeyInfo?.caInfo?.caHash,
          symbol: 'ELF',
          amount: '10000000',
          to: 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk',
        },
      },
      tDVW: {
        method: 'ManagerTransfer',
        params: {
          caHash: wallet?.portkeyInfo?.caInfo?.caHash,
          symbol: 'ELF',
          amount: '15000000',
          to: 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk',
        },
      },
    },
  };

  const examples = [
    useExampleCall('test sendMultiTransaction', async () => {
      return await sendMultiTransaction(paramsForMuti);
    }),

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

    useExampleCall('Approve in AELF with useWebLogin', async () => {
      return await callContract({
        contractAddress: configJson.multiToken,
        methodName: 'Approve',
        args: {
          symbol: 'ELF',
          spender: configJson.multiToken,
          amount: '100000000',
        },
      });
    }),

    useExampleCall('Approve in tDVW with useWebLogin', async () => {
      return await callContract({
        contractAddress: configTdvwJson.multiToken,
        methodName: 'Approve',
        args: {
          symbol: 'ELF',
          spender: configTdvwJson.multiToken,
          amount: '100000000',
        },
        options: {
          chainId: 'tDVW',
        },
      });
    }),

    useExampleCall('Approve in AELF', async () => {
      return await callContractWithLog(callSendMethodAELF, {
        contractAddress: configJson.multiToken,
        methodName: 'Approve',
        args: {
          symbol: 'ELF',
          spender: configJson.multiToken,
          amount: '100000000',
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

    useExampleCall('call getBalance in tDVW when tDVW is sync', async () => {
      const isCurrentChainIdSync = await getCurrentChainIdSync();
      console.log(isCurrentChainIdSync, 'isCurrentChainIdSync');
      if (!isCurrentChainIdSync) {
        throw new Error('tDVW is not sync');
      }
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
      {examples.map((example, index) => {
        return <div key={example.name}>{example.render()}</div>;
      })}
    </div>
  );
}
