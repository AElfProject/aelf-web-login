import React from 'react';
import { Button } from 'aelf-design';
import { init } from '@aelf-web-login/wallet-adapter-bridge';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';

const config = {
  wallets: [
    new PortkeyDiscoverWallet({
      networkType: 'MAINNET',
    }),
  ],
};

const { connect } = init(config);

const Demo = () => (
  <Button type="primary" onClick={connect}>
    connect
  </Button>
);

export default Demo;
