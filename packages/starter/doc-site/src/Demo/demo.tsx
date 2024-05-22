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
    networkType: NETWORK_TYPE,
    chainId: CHAIN_ID,
    keyboard: true,
    noCommonBaseModal: false,
    design: 'CryptoDesign', // "SocialDesign" | "CryptoDesign" | "Web2Design"
    titleForSocialDesign: 'Crypto wallet',
    iconSrcForSocialDesign:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IkVsZiBFeHBsb3JlciI+CjxyZWN0IHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgZmlsbD0id2hpdGUiLz4KPHBhdGggaWQ9IlNoYXBlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLjAwMDMgMTEuODQyQzMzLjEwNjkgMTEuODQyIDM1LjYyNTIgOS4zMjM3MSAzNS42MjUyIDYuMjE3MTlDMzUuNjI1MiAzLjExMDY4IDMzLjEwNjkgMC41OTIzNDYgMzAuMDAwMyAwLjU5MjM0NkMyNi44OTM4IDAuNTkyMzQ2IDI0LjM3NTUgMy4xMTA2OCAyNC4zNzU1IDYuMjE3MTlDMjQuMzc1NSA5LjMyMzcxIDI2Ljg5MzggMTEuODQyIDMwLjAwMDMgMTEuODQyWk01NS40MDkzIDI4LjAzNzhDNTUuNDA5MyAzNC4zNTc5IDUwLjI4NTggMzkuNDgxNCA0My45NjU3IDM5LjQ4MTRDMzcuNjQ1NSAzOS40ODE0IDMyLjUyMiAzNC4zNTc5IDMyLjUyMiAyOC4wMzc4QzMyLjUyMiAyMS43MTc2IDM3LjY0NTUgMTYuNTk0MSA0My45NjU3IDE2LjU5NDFDNTAuMjg1OCAxNi41OTQxIDU1LjQwOTMgMjEuNzE3NiA1NS40MDkzIDI4LjAzNzhaTTM1LjYyNTIgNDkuODU4MkMzNS42MjUyIDUyLjk2NDggMzMuMTA2OSA1NS40ODMxIDMwLjAwMDMgNTUuNDgzMUMyNi44OTM4IDU1LjQ4MzEgMjQuMzc1NSA1Mi45NjQ4IDI0LjM3NTUgNDkuODU4MkMyNC4zNzU1IDQ2Ljc1MTcgMjYuODkzOCA0NC4yMzM0IDMwLjAwMDMgNDQuMjMzNEMzMy4xMDY5IDQ0LjIzMzQgMzUuNjI1MiA0Ni43NTE3IDM1LjYyNTIgNDkuODU4MlpNMS4xOTczMyAxMi4yM0MtMC40NTEzMzEgMTYuNTk0MSAxLjg3NjE5IDIxLjU0MDEgNi4yNDAzIDIzLjE4ODdDOS4xNDk3IDI0LjI1NTUgMTIuMjUzMSAyMy42NzM2IDE0LjQ4MzYgMjEuODMxQzE2LjUyMDIgMjAuMzc2MyAxOS4xMzg3IDE5Ljg5MTQgMjEuNjYwMSAyMC44NjEyQzIzLjMwODggMjEuNDQzMSAyNC41Njk1IDIyLjUwOTkgMjUuNDQyNCAyMy44Njc2TDI1LjUzOTMgMjQuMDYxNUMyNS45MjczIDI0LjY0MzQgMjYuNTA5MSAyNS4yMjUzIDI3LjI4NSAyNS40MTkzQzI5LjAzMDYgMjYuMDk4MSAzMS4wNjcyIDI1LjEyODMgMzEuNjQ5MSAyMy4zODI3QzMyLjMyOCAyMS42MzcgMzEuMzU4MiAxOS42MDA1IDI5LjYxMjUgMTkuMDE4NkMyOC44MzY3IDE4LjcyNzYgMjguMDYwOCAxOC43Mjc2IDI3LjI4NSAxOS4wMTg2QzI1LjczMzMgMTkuNTAzNSAyMy45ODc3IDE5LjUwMzUgMjIuMzM5IDE4LjkyMTZDMTkuOTE0NSAxOC4wNDg4IDE4LjI2NTggMTYuMTA5MiAxNy41ODcgMTMuODc4NkwxNy40OSAxMy42ODQ3QzE3LjQ5IDEzLjU4NzcgMTcuNDkgMTMuNDkwNyAxNy4zOTMgMTMuNDkwN1YxMy4yOTY4QzE2LjcxNDIgMTAuNTgxMyAxNC44NzE1IDguMjUzNzggMTIuMDU5MSA3LjI4Mzk4QzcuNjk1IDUuNTM4MzQgMi43NDkwMSA3Ljc2ODg4IDEuMTk3MzMgMTIuMjNaTTYuMjQwMyAzMi44ODY4QzEuODc2MTkgMzQuNTM1NCAtMC40NTEzMzEgMzkuNDgxNCAxLjE5NzMzIDQzLjg0NTVDMi44NDU5OSA0OC4zMDY2IDcuNjk1IDUwLjUzNzIgMTIuMDU5MSA0OC43OTE1QzE0Ljg3MTUgNDcuODIxNyAxNi43MTQyIDQ1LjQ5NDIgMTcuMzkzIDQyLjc3ODdWNDIuNTg0OEMxNy40OSA0Mi41ODQ4IDE3LjQ5IDQyLjQ4NzggMTcuNDkgNDIuMzkwOEwxNy41ODcgNDIuMTk2OUMxOC4yNjU4IDM5Ljk2NjMgMTkuOTE0NSAzOC4wMjY3IDIyLjMzOSAzNy4xNTM5QzIzLjk4NzcgMzYuNTcyIDI1LjczMzMgMzYuNTcyIDI3LjI4NSAzNy4wNTY5QzI4LjA2MDggMzcuMzQ3OSAyOC44MzY3IDM3LjM0NzkgMjkuNjEyNSAzNy4wNTY5QzMxLjM1ODIgMzYuNDc1IDMyLjMyOCAzNC40Mzg1IDMxLjY0OTEgMzIuNjkyOEMzMS4wNjcyIDMwLjk0NzIgMjkuMDMwNiAyOS45Nzc0IDI3LjI4NSAzMC42NTYyQzI2LjUwOTEgMzAuODUwMiAyNS45MjczIDMxLjQzMjEgMjUuNTM5MyAzMi4wMTRMMjUuNDQyNCAzMi4yMDc5QzI0LjU2OTUgMzMuNTY1NiAyMy4zMDg4IDM0LjYzMjQgMjEuNjYwMSAzNS4yMTQzQzE5LjEzODcgMzYuMTg0MSAxNi41MjAyIDM1LjY5OTIgMTQuNDgzNiAzNC4yNDQ1QzEyLjI1MzEgMzIuNDAxOSA5LjE0OTcgMzEuODIgNi4yNDAzIDMyLjg4NjhaIiBmaWxsPSIjMjY2Q0QzIi8+CjwvZz4KPC9zdmc+Cg==',
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
          rpcUrl: 'https://explorer-test-side02.aelf.io/chain',
        },
        tDVV: {
          chainId: 'tDVV',
          rpcUrl: 'https://explorer-test-side02.aelf.io/chain',
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

const LoginDemo = () => {
  const {
    connectWallet,
    disConnectWallet,
    walletInfo,
    lock,
    isLocking,
    walletType,
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
        {isLocking ? 'unlock' : 'connect'}
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
      <div>walletType:{walletType}</div>
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
