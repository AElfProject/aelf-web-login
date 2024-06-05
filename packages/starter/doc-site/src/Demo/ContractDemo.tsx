import { useState } from 'react';
import { Button } from 'antd';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import configJson from './contract/config.json';
import configTdvwJson from './contract/config.tdvw.json';

function useExampleCall(name: string, func: () => any) {
  const [result, setResult] = useState({});
  const { walletInfo } = useConnectWallet();

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
      setResult({ error });
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
            <Button disabled={!walletInfo} onClick={onClick}>
              {name}
            </Button>
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

const ContractDemo: React.FC = () => {
  const {
    callSendMethod,
    callViewMethod,
    walletInfo,
    getAccountByChainId,
    getWalletSyncIsCompleted,
  } = useConnectWallet();
  console.log('ContractDemo init----------');

  const examples = [
    useExampleCall('call getBalance', async () => {
      return callViewMethod({
        contractAddress: configJson.multiToken,
        methodName: 'GetBalance',
        args: {
          symbol: 'ELF',
          owner: (walletInfo as any).address,
        },
      });
    }),

    useExampleCall('call getBalance in tDVW', async () => {
      return callViewMethod({
        chainId: 'tDVW',
        contractAddress: configTdvwJson.multiToken,
        methodName: 'GetBalance',
        args: {
          symbol: 'ELF',
          owner: await getAccountByChainId('tDVW'),
        },
      });
    }),

    useExampleCall('call getBalance in tDVV', async () => {
      return callViewMethod({
        chainId: 'tDVV',
        contractAddress: configTdvwJson.multiToken,
        methodName: 'GetBalance',
        args: {
          symbol: 'ELF',
          owner: await getAccountByChainId('tDVV'),
        },
      });
    }),

    useExampleCall('Buy 1 WRITE', async () => {
      return await callSendMethod({
        contractAddress: configJson.tokenConverter,
        methodName: 'Buy',
        args: {
          symbol: configJson.resourceTokens[0].symbol,
          amount: 1 * Math.pow(10, configJson.resourceTokens[0].decimals),
        },
      });
    }),

    useExampleCall('Approve in AELF', async () => {
      return await callSendMethod({
        chainId: 'AELF',
        contractAddress: configJson.multiToken,
        methodName: 'Approve',
        args: {
          symbol: 'ELF',
          spender: configJson.multiToken,
          amount: '100000000',
        },
      });
    }),

    useExampleCall('Approve in tDVW', async () => {
      return await callSendMethod({
        chainId: 'tDVW',
        contractAddress: configTdvwJson.multiToken,
        methodName: 'Approve',
        args: {
          symbol: 'ELF',
          spender: configTdvwJson.multiToken,
          amount: '100000000',
        },
      });
    }),

    useExampleCall('call getBalance in tDVW when tDVW is sync', async () => {
      const isCurrentChainIdSync = await getWalletSyncIsCompleted('tDVW');
      console.log(isCurrentChainIdSync, 'isCurrentChainIdSync');
      if (!isCurrentChainIdSync) {
        throw new Error('tDVW is not sync');
      }
      return callViewMethod({
        chainId: 'tDVW',
        contractAddress: configTdvwJson.multiToken,
        methodName: 'GetBalance',
        args: {
          symbol: 'ELF',
          owner: await getAccountByChainId('tDVW'),
        },
      });
    }),

    useExampleCall('Buy 1 WRITE in tDVW', async () => {
      return await callSendMethod({
        chainId: 'tDVW',
        contractAddress: configTdvwJson.tokenConverter as unknown as string,
        methodName: 'Buy',
        args: {
          symbol: configJson.resourceTokens[0].symbol,
          amount: 1 * Math.pow(10, configJson.resourceTokens[0].decimals),
        },
      });
    }),
  ];
  return (
    <div>
      {examples.map((example) => {
        return <div key={example.name}>{example.render()}</div>;
      })}
    </div>
  );
};

export default ContractDemo;
