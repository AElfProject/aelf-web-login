import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyInnerWallet } from '@aelf-web-login/wallet-adapter-portkey-web';

import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { WebLoginProvider } from '@aelf-web-login/wallet-adapter-react';
import type { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { type TChainId, SignInDesignEnum, NetworkEnum } from '@aelf-web-login/wallet-adapter-base';
import { Tabs, type TabsProps } from 'antd';
import './telegram.js';

import LoginDemo from './LoginDemo';
import AccountDemo from './AccountDemo';
import ContractDemo from './ContractDemo';
import SignatureDemo from './SignatureDemo';
import UtilsDemo from './UtilsDemo';
import { useMemo } from 'react';

const APP_NAME = 'forest';
const CHAIN_ID = 'tDVW' as TChainId;
const NETWORK_TYPE = NetworkEnum.TESTNET;
const RPC_SERVER_AELF = 'https://explorer-test.aelf.io/chain';
const RPC_SERVER_TDVV = 'https://explorer-test-side02.aelf.io/chain';
const RPC_SERVER_TDVW = 'https://explorer-test-side02.aelf.io/chain';

const baseConfig: IConfigProps['baseConfig'] = {
  enableAcceleration: true,
  appName: 'test-appName',
  theme: 'light',
  showVconsole: true,
  // omitTelegramScript: false,
  // cancelAutoLoginInTelegram: false,
  networkType: NETWORK_TYPE,
  chainId: CHAIN_ID,
  sideChainId: CHAIN_ID,
  design: SignInDesignEnum.SocialDesign, // "SocialDesign" | "CryptoDesign" | "Web2Design"
};

const wallets = [
  new PortkeyInnerWallet({ networkType: NETWORK_TYPE, chainId: CHAIN_ID, disconnectConfirm: true }),
  new PortkeyDiscoverWallet({
    networkType: NETWORK_TYPE,
    chainId: CHAIN_ID,
    autoRequestAccount: true, // If set to true, please contact Portkey to add whitelist @Rachel
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
    defaultRpcUrl: RPC_SERVER_AELF,
    nodes: {
      AELF: {
        chainId: 'AELF',
        rpcUrl: RPC_SERVER_AELF,
      },
      tDVW: {
        chainId: 'tDVW',
        rpcUrl: RPC_SERVER_TDVW,
      },
      tDVV: {
        chainId: 'tDVV',
        rpcUrl: RPC_SERVER_TDVV,
      },
    },
  }),
];

const config: IConfigProps = {
  baseConfig,
  wallets,
};

const items: TabsProps['items'] = [
  {
    key: 'AccountDemo',
    label: 'AccountDemo',
    children: <AccountDemo />,
  },
  {
    key: 'ContractDemo',
    label: 'ContractDemo',
    children: <ContractDemo />,
  },
  {
    key: 'SignatureDemo',
    label: 'SignatureDemo',
    children: <SignatureDemo />,
  },
  {
    key: 'UtilsDemo',
    label: 'UtilsDemo',
    children: <UtilsDemo />,
  },
];
console.log(config);
const App: React.FC = () => {
  // const bridgeAPI = init(config);

  const extraElementInConnectModal = useMemo(
    () => (
      <div
        style={{
          color: baseConfig.theme === 'dark' ? '#fff' : 'black',
        }}
      >
        By continuing, you agree to the Terms of Service and Privacy Policy.
      </div>
    ),
    [],
  );
  return (
    <WebLoginProvider config={config} extraElementInConnectModal={extraElementInConnectModal}>
      <LoginDemo />
      <Tabs defaultActiveKey="ContractDemo" items={items} />
    </WebLoginProvider>
  );
};

export default App;
