import React from 'react';
import { Button } from 'aelf-design';
import { TWalletInfo } from '@aelf-web-login/wallet-adapter-base';
import { init } from '@aelf-web-login/wallet-adapter-bridge';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';

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

const { connect, disConnect } = init(config);

const Demo = () => {
  const [walletInfo, setWalletInfo] = React.useState<TWalletInfo>({} as TWalletInfo);
  const onConnectBtnClickHandler = async () => {
    // connect().then((rs) => {
    //   setWalletInfo(rs);
    // });
    const rs = await connect();
    setWalletInfo(rs);
  };

  const onDisConnectBtnClickHandler = () => {
    disConnect();
    setWalletInfo({} as TWalletInfo);
  };
  return (
    <div>
      <Button type="primary" onClick={onConnectBtnClickHandler}>
        connect
      </Button>
      <div>
        walletInfo:
        <pre>{JSON.stringify(walletInfo, null, 4)}</pre>
      </div>
      <div>
        walletType:
        {localStorage.getItem('connectedWallet')}
      </div>
      <Button type="primary" onClick={onDisConnectBtnClickHandler}>
        disConnect
      </Button>
    </div>
  );
};

export default Demo;
