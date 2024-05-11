import React, { useState } from 'react';
import { Button } from 'aelf-design';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyAAWallet } from '@aelf-web-login/wallet-adapter-portkey-aa';
import { WebLoginProvider, init, useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';
import { IBaseConfig } from '@aelf-web-login/wallet-adapter-bridge';

const APPNAME = 'explorer.aelf.io';
const WEBSITE_ICON = 'https://explorer.aelf.io/favicon.main.ico';
const IS_MAINNET = false;
const graphQLServer = !IS_MAINNET
  ? 'https://dapp-aa-portkey-test.portkey.finance'
  : 'https://dapp-aa-portkey.portkey.finance';

export const connectUrl = !IS_MAINNET
  ? 'https://auth-aa-portkey-test.portkey.finance'
  : 'https://auth-aa-portkey.portkey.finance';

const portkeyScanUrl = `${graphQLServer}/Portkey_DID/PortKeyIndexerCASchema/graphql`;
const didConfig: GlobalConfigProps = {
  graphQLUrl: portkeyScanUrl,
  connectUrl: connectUrl,
  requestDefaults: {
    baseURL: 'https://aa-portkey-test.portkey.finance',
    timeout: 30000,
  },
  socialLogin: {
    Portkey: {
      websiteName: APPNAME,
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
    chainId: 'AELF',
    keyboard: true,
    design: 'CryptoDesign', // "SocialDesign" | "CryptoDesign" | "Web2Design"
  } as IBaseConfig,
  wallets: [
    new PortkeyAAWallet({
      appName: APPNAME,
      chainId: 'AELF',
      autoShowUnlock: true,
    }),
    new PortkeyDiscoverWallet({
      networkType: 'TESTNET',
      chainId: 'AELF',
      autoRequestAccount: true,
      autoLogoutOnDisconnected: true,
      autoLogoutOnNetworkMismatch: true,
      autoLogoutOnAccountMismatch: true,
      autoLogoutOnChainMismatch: true,
    }),
  ],
};

const Demo = () => {
  const {
    connectWallet,
    disConnectWallet,
    stateFromStore,
    loginState,
    lock,
    getAccountByChainId,
    getWalletSyncIsCompleted,
  } = useConnectWallet();
  // why loginState is undefined, instead of LoginStateEnum.INITIAL
  console.log('walletInfo----------:', loginState);
  const [aelfAccount, setAelfAccount] = useState<string>('');
  const [tdvwAccount, setTdvwAccount] = useState<string>('');
  const [syncIsCompleted, setSyncIsCompleted] = useState<string | boolean>(false);
  const [syncIsCompletedTDVW, setSyncIsCompletedTDVW] = useState<string | boolean>(false);

  const onConnectBtnClickHandler = async () => {
    try {
      const rs = await connectWallet();
      console.log('rs', rs);
    } catch (e) {
      console.log('eeeee', e);
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
      <Button
        type="primary"
        onClick={onConnectBtnClickHandler}
        disabled={!!stateFromStore.walletInfo}
      >
        connect
      </Button>
      <Button type="primary" onClick={lock} disabled={!stateFromStore.walletInfo}>
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
        <pre>{JSON.stringify(stateFromStore.walletInfo, null, 4)}</pre>
      </div>
      <div>
        walletType:
        {localStorage.getItem('connectedWallet')}
      </div>
      <Button
        type="primary"
        onClick={onDisConnectBtnClickHandler}
        disabled={!stateFromStore.walletInfo}
      >
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
