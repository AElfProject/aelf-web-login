import React from 'react';
import { Button } from 'aelf-design';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { WebLoginProvider, init, useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

const config = {
  wallets: [
    new PortkeyDiscoverWallet({
      networkType: 'MAINNET',
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
  const { connectWallet, disConnectWallet, connecting, stateFromStore } = useConnectWallet();

  console.log('walletInfo----------:', stateFromStore);
  const onConnectBtnClickHandler = async () => {
    // connect().then((rs) => {
    //   setWalletInfo(rs);
    // });
    const rs = await connectWallet();
    console.log('rs', rs);
  };

  const onDisConnectBtnClickHandler = () => {
    disConnectWallet();
  };
  return (
    <div>
      <Button
        type="primary"
        onClick={onConnectBtnClickHandler}
        disabled={connecting || !!stateFromStore.walletInfo}
      >
        connect
      </Button>
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
