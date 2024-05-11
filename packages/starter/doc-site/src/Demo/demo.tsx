import React, { useState } from 'react';
import { Button } from 'aelf-design';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyAAWallet } from '@aelf-web-login/wallet-adapter-portkey-aa';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { WebLoginProvider, init, useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';

const APP_NAME = 'explorer.aelf.io';
const WEBSITE_ICON = 'https://explorer.aelf.io/favicon.main.ico';
const CHAIN_ID = 'AELF';
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
      networkType: 'TESTNET',
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

const Demo = () => {
  const {
    connectWallet,
    disConnectWallet,
    walletInfo,
    loginState,
    lock,
    getAccountByChainId,
    getWalletSyncIsCompleted,
  } = useConnectWallet();
  // TODO: why loginState is undefined, instead of LoginStateEnum.INITIAL
  console.log('page init----------:', loginState);
  const [aelfAccount, setAelfAccount] = useState<string>('');
  const [tdvwAccount, setTdvwAccount] = useState<string>('');
  const [syncIsCompleted, setSyncIsCompleted] = useState<string | boolean>(false);
  const [syncIsCompletedTDVW, setSyncIsCompletedTDVW] = useState<string | boolean>(false);

  const onConnectBtnClickHandler = async () => {
    try {
      const rs = await connectWallet();
      console.log('rs', rs);
    } catch (e) {
      console.log('ERR', e);
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
      <Button type="primary" onClick={onConnectBtnClickHandler} disabled={!!walletInfo}>
        connect
      </Button>
      <Button type="primary" onClick={lock} disabled={!walletInfo}>
        lock
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

      <div>loginState:{loginState}</div>
      <div>
        walletInfo:
        <pre>{JSON.stringify(walletInfo, null, 4)}</pre>
      </div>
      <div>
        walletType:
        {localStorage.getItem('connectedWallet')}
      </div>
      <Button type="primary" onClick={onDisConnectBtnClickHandler} disabled={!walletInfo}>
        disConnect
      </Button>
    </div>
  );
};

const App = () => {
  const bridgeAPI = init(config);
  return (
    <WebLoginProvider bridgeAPI={bridgeAPI}>
      <Demo />
    </WebLoginProvider>
  );
};

export default App;
