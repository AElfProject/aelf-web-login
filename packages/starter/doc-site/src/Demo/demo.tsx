import React, { useState } from 'react';
import { Button, Input } from 'aelf-design';
import { message } from 'antd';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyAAWallet } from '@aelf-web-login/wallet-adapter-portkey-aa';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { WebLoginProvider, init, useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import configJson from './contract/config.json';
import configTdvwJson from './contract/config.tdvw.json';

const APP_NAME = 'explorer.aelf.io';
const WEBSITE_ICON = 'https://explorer.aelf.io/favicon.main.ico';
const CHAIN_ID = 'AELF';
const NETWORK_TYPE = 'TESTNET';
const RPC_SERVER = 'https://explorer-test.aelf.io/chain';

const IS_MAINNET = false;
const graphQLServer = !IS_MAINNET
  ? 'https://dapp-aa-portkey-test.portkey.finance'
  : 'https://dapp-aa-portkey.portkey.finance';

const connectUrl = !IS_MAINNET
  ? 'https://auth-aa-portkey-test.portkey.finance'
  : 'https://auth-aa-portkey.portkey.finance';

const portkeyScanUrl = `${graphQLServer}/Portkey_DID/PortKeyIndexerCASchema/graphql`;
const didConfig = {
  graphQLUrl: portkeyScanUrl,
  connectUrl: connectUrl,
  requestDefaults: {
    baseURL: 'https://aa-portkey-test.portkey.finance',
    timeout: 30000,
  },
  socialLogin: {
    Portkey: {
      websiteName: APP_NAME,
      websiteIcon: WEBSITE_ICON,
    },
  },
  //TODO:  still need here? delete it, implement store that support SSR
  // networkType: NETWORK,
  // useLocalStorage: true,
};

const config = {
  didConfig,
  baseConfig: {
    // TODO: type error
    networkType: NETWORK_TYPE,
    chainId: CHAIN_ID,
    keyboard: true,
    design: 'CryptoDesign', // "SocialDesign" | "CryptoDesign" | "Web2Design"
  },
  wallets: [
    new PortkeyAAWallet({
      appName: APP_NAME,
      chainId: CHAIN_ID,
      autoShowUnlock: true,
    }),
    new PortkeyDiscoverWallet({
      networkType: NETWORK_TYPE,
      chainId: CHAIN_ID,
      autoRequestAccount: true,
      autoLogoutOnDisconnected: true,
      autoLogoutOnNetworkMismatch: true,
      autoLogoutOnAccountMismatch: true,
      autoLogoutOnChainMismatch: true,
    }),
    new NightElfWallet({
      chainId: CHAIN_ID,
      appName: APP_NAME,
      connectEagerly: true,
      useMultiChain: false,
      defaultRpcUrl: RPC_SERVER,
      nodes: {
        AELF: {
          chainId: 'AELF',
          rpcUrl: RPC_SERVER,
        },
        tDVW: {
          chainId: 'tDVW',
          rpcUrl: RPC_SERVER,
        },
        tDVV: {
          chainId: 'tDVV',
          rpcUrl: 'http://192.168.66.106:8000',
        },
      },
    }),
  ],
} as IConfigProps;

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

const ContractDemo = () => {
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

const LoginDemo = () => {
  const {
    connectWallet,
    disConnectWallet,
    walletInfo,
    lock,
    getAccountByChainId,
    getWalletSyncIsCompleted,
  } = useConnectWallet();
  console.log('LoginDemo init----------');
  const [messageApi, contextHolder] = message.useMessage();
  const [aelfAccount, setAelfAccount] = useState<string>('');
  const [tdvwAccount, setTdvwAccount] = useState<string>('');
  const [syncIsCompleted, setSyncIsCompleted] = useState<string | boolean>(false);
  const [syncIsCompletedTDVW, setSyncIsCompletedTDVW] = useState<string | boolean>(false);

  const onConnectBtnClickHandler = async () => {
    try {
      const rs = await connectWallet();
      console.log('rs', rs);
    } catch (e: any) {
      messageApi.open({
        type: 'error',
        content: e.message,
      });
    }
  };

  const onDisConnectBtnClickHandler = () => {
    disConnectWallet();
  };

  const onGetAccountByAELFHandler = async () => {
    const account = await getAccountByChainId('AELF');
    setAelfAccount(account);
  };

  const onGetAccountBytDVWHandler = async () => {
    const account = await getAccountByChainId('tDVW');
    setTdvwAccount(account);
  };

  const onGetWalletSyncIsCompletedHandler = async () => {
    const account = await getWalletSyncIsCompleted('AELF');
    setSyncIsCompleted(account);
  };

  const onGetWalletSyncIsCompletetDVWdHandler = async () => {
    const account = await getWalletSyncIsCompleted('tDVW');
    setSyncIsCompletedTDVW(account);
  };

  return (
    <div>
      {contextHolder}
      <Button type="primary" onClick={onConnectBtnClickHandler} disabled={!!walletInfo}>
        connect
      </Button>
      <Button type="primary" onClick={lock} disabled={!walletInfo}>
        lock
      </Button>
      <Button type="primary" onClick={onDisConnectBtnClickHandler} disabled={!walletInfo}>
        disConnect
      </Button>
      <Button type="primary" onClick={onGetAccountByAELFHandler}>
        getAccountByChainId-AELF
      </Button>
      <div>getAccountByChainId-AELF:{aelfAccount}</div>

      <Button type="primary" onClick={onGetAccountBytDVWHandler}>
        getAccountByChainId-tDVW
      </Button>
      <div>getAccountByChainId-tDVW:{tdvwAccount}</div>

      <Button type="primary" onClick={onGetWalletSyncIsCompletedHandler}>
        getWalletSyncIsCompleted-AELF
      </Button>
      <div>getWalletSyncIsCompleted-AELF:{syncIsCompleted}</div>

      <Button type="primary" onClick={onGetWalletSyncIsCompletetDVWdHandler}>
        getWalletSyncIsCompleted-tDVW
      </Button>
      <div>getWalletSyncIsCompleted-tDVW:{syncIsCompletedTDVW}</div>

      <div>
        walletInfo:
        <pre style={{ overflow: 'auto', height: '300px' }}>
          {JSON.stringify(walletInfo, null, 4)}
        </pre>
      </div>
      <div>
        walletType:
        {localStorage.getItem('connectedWallet')}
      </div>
    </div>
  );
};

const SignatureDemo = () => {
  const { walletInfo, getSignature } = useConnectWallet();
  const [signInfo, setSignInfo] = useState('');
  const [signed, setSigned] = useState('');

  const sign = async () => {
    const signature = await getSignature({
      signInfo,
      appName: '',
      address: '',
    });
    console.log('signature', signature);
    setSigned(signature!.signature);
  };

  return (
    <div>
      <div>
        <Button disabled={!walletInfo} onClick={sign}>
          Sign
        </Button>
        <Input value={signInfo} onChange={(e) => setSignInfo(e.target.value)} />
        <div>{signed}</div>
      </div>
    </div>
  );
};

const App = () => {
  const bridgeAPI = init(config);
  return (
    <WebLoginProvider bridgeAPI={bridgeAPI}>
      <LoginDemo />
      <ContractDemo />
      <SignatureDemo />
    </WebLoginProvider>
  );
};

export default App;
