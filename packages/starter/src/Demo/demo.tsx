import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyAAWallet } from '@aelf-web-login/wallet-adapter-portkey-aa';
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
import AssetsDemo from './AssetsDemo';

const APP_NAME = 'forest';
const WEBSITE_ICON = 'https://explorer.aelf.io/favicon.main.ico';
const CHAIN_ID = 'tDVW' as TChainId;
const NETWORK_TYPE = NetworkEnum.TESTNET;
const RPC_SERVER_AELF = 'https://explorer-test.aelf.io/chain';
const RPC_SERVER_TDVV = 'https://explorer-test-side02.aelf.io/chain';
const RPC_SERVER_TDVW = 'https://explorer-test-side02.aelf.io/chain';
const GRAPHQL_SERVER =
  'https://dapp-aa-portkey-test.portkey.finance/aefinder-v2/api/app/graphql/portkey';
const CONNECT_SERVER = 'https://auth-aa-portkey-test.portkey.finance';
const SERVICE_SERVER = 'https://aa-portkey-test.portkey.finance';
const TELEGRAM_BOT_ID = '7781140664';

const didConfig = {
  graphQLUrl: GRAPHQL_SERVER,
  connectUrl: CONNECT_SERVER,
  serviceUrl: SERVICE_SERVER,
  requestDefaults: {
    baseURL: SERVICE_SERVER,
    timeout: 30000,
  },
  socialLogin: {
    Portkey: {
      websiteName: APP_NAME,
      websiteIcon: WEBSITE_ICON,
    },
    Telegram: {
      botId: TELEGRAM_BOT_ID,
    },
  },
  eTransferCA: {
    AELF: '4xWFvoLvi5anZERDuJvzfMoZsb6WZLATEzqzCVe8sQnCp2XGS',
    tDVW: '2AgU8BfyKyrxUrmskVCUukw63Wk96MVfVoJzDDbwKszafioCN1',
  },
  eTransferUrl: 'https://test-app.etransfer.exchange',
  // customNetworkType: NETWORK_TYPE === 'TESTNET' ? 'offline' : 'online',
  // loginConfig: {
  //   loginMethodsOrder: [ "Email",  "Google" , "Apple" ,  "Scan"]
  // }
};

// const SignInProxy = () => {
//   // console.log('SignInProxy-----------');
//   // const { isLocking } = useConnectWallet();
//   // console.log('-----', isLocking);
//   return <div>111</div>;
// };

const baseConfig: IConfigProps['baseConfig'] = {
  PortkeyProviderProps: {
    theme: 'dark',
  },
  // ConfirmLogoutDialog: CustomizedConfirmLogoutDialog,
  // SignInComponent: SignInProxy,
  defaultPin: '111111',
  enableAcceleration: true,
  // PortkeyProviderProps: {
  //   theme: 'dark' as any,
  // },
  showVconsole: true,
  // omitTelegramScript: false,
  // cancelAutoLoginInTelegram: false,
  networkType: NETWORK_TYPE,
  chainId: CHAIN_ID,
  sideChainId: CHAIN_ID,
  keyboard: true,
  noCommonBaseModal: false,
  design: SignInDesignEnum.CryptoDesign, // "SocialDesign" | "CryptoDesign" | "Web2Design"
  // titleForSocialDesign: 'Crypto wallet',
  iconSrcForSocialDesign:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IkVsZiBFeHBsb3JlciI+CjxyZWN0IHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgZmlsbD0id2hpdGUiLz4KPHBhdGggaWQ9IlNoYXBlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLjAwMDMgMTEuODQyQzMzLjEwNjkgMTEuODQyIDM1LjYyNTIgOS4zMjM3MSAzNS42MjUyIDYuMjE3MTlDMzUuNjI1MiAzLjExMDY4IDMzLjEwNjkgMC41OTIzNDYgMzAuMDAwMyAwLjU5MjM0NkMyNi44OTM4IDAuNTkyMzQ2IDI0LjM3NTUgMy4xMTA2OCAyNC4zNzU1IDYuMjE3MTlDMjQuMzc1NSA5LjMyMzcxIDI2Ljg5MzggMTEuODQyIDMwLjAwMDMgMTEuODQyWk01NS40MDkzIDI4LjAzNzhDNTUuNDA5MyAzNC4zNTc5IDUwLjI4NTggMzkuNDgxNCA0My45NjU3IDM5LjQ4MTRDMzcuNjQ1NSAzOS40ODE0IDMyLjUyMiAzNC4zNTc5IDMyLjUyMiAyOC4wMzc4QzMyLjUyMiAyMS43MTc2IDM3LjY0NTUgMTYuNTk0MSA0My45NjU3IDE2LjU5NDFDNTAuMjg1OCAxNi41OTQxIDU1LjQwOTMgMjEuNzE3NiA1NS40MDkzIDI4LjAzNzhaTTM1LjYyNTIgNDkuODU4MkMzNS42MjUyIDUyLjk2NDggMzMuMTA2OSA1NS40ODMxIDMwLjAwMDMgNTUuNDgzMUMyNi44OTM4IDU1LjQ4MzEgMjQuMzc1NSA1Mi45NjQ4IDI0LjM3NTUgNDkuODU4MkMyNC4zNzU1IDQ2Ljc1MTcgMjYuODkzOCA0NC4yMzM0IDMwLjAwMDMgNDQuMjMzNEMzMy4xMDY5IDQ0LjIzMzQgMzUuNjI1MiA0Ni43NTE3IDM1LjYyNTIgNDkuODU4MlpNMS4xOTczMyAxMi4yM0MtMC40NTEzMzEgMTYuNTk0MSAxLjg3NjE5IDIxLjU0MDEgNi4yNDAzIDIzLjE4ODdDOS4xNDk3IDI0LjI1NTUgMTIuMjUzMSAyMy42NzM2IDE0LjQ4MzYgMjEuODMxQzE2LjUyMDIgMjAuMzc2MyAxOS4xMzg3IDE5Ljg5MTQgMjEuNjYwMSAyMC44NjEyQzIzLjMwODggMjEuNDQzMSAyNC41Njk1IDIyLjUwOTkgMjUuNDQyNCAyMy44Njc2TDI1LjUzOTMgMjQuMDYxNUMyNS45MjczIDI0LjY0MzQgMjYuNTA5MSAyNS4yMjUzIDI3LjI4NSAyNS40MTkzQzI5LjAzMDYgMjYuMDk4MSAzMS4wNjcyIDI1LjEyODMgMzEuNjQ5MSAyMy4zODI3QzMyLjMyOCAyMS42MzcgMzEuMzU4MiAxOS42MDA1IDI5LjYxMjUgMTkuMDE4NkMyOC44MzY3IDE4LjcyNzYgMjguMDYwOCAxOC43Mjc2IDI3LjI4NSAxOS4wMTg2QzI1LjczMzMgMTkuNTAzNSAyMy45ODc3IDE5LjUwMzUgMjIuMzM5IDE4LjkyMTZDMTkuOTE0NSAxOC4wNDg4IDE4LjI2NTggMTYuMTA5MiAxNy41ODcgMTMuODc4NkwxNy40OSAxMy42ODQ3QzE3LjQ5IDEzLjU4NzcgMTcuNDkgMTMuNDkwNyAxNy4zOTMgMTMuNDkwN1YxMy4yOTY4QzE2LjcxNDIgMTAuNTgxMyAxNC44NzE1IDguMjUzNzggMTIuMDU5MSA3LjI4Mzk4QzcuNjk1IDUuNTM4MzQgMi43NDkwMSA3Ljc2ODg4IDEuMTk3MzMgMTIuMjNaTTYuMjQwMyAzMi44ODY4QzEuODc2MTkgMzQuNTM1NCAtMC40NTEzMzEgMzkuNDgxNCAxLjE5NzMzIDQzLjg0NTVDMi44NDU5OSA0OC4zMDY2IDcuNjk1IDUwLjUzNzIgMTIuMDU5MSA0OC43OTE1QzE0Ljg3MTUgNDcuODIxNyAxNi43MTQyIDQ1LjQ5NDIgMTcuMzkzIDQyLjc3ODdWNDIuNTg0OEMxNy40OSA0Mi41ODQ4IDE3LjQ5IDQyLjQ4NzggMTcuNDkgNDIuMzkwOEwxNy41ODcgNDIuMTk2OUMxOC4yNjU4IDM5Ljk2NjMgMTkuOTE0NSAzOC4wMjY3IDIyLjMzOSAzNy4xNTM5QzIzLjk4NzcgMzYuNTcyIDI1LjczMzMgMzYuNTcyIDI3LjI4NSAzNy4wNTY5QzI4LjA2MDggMzcuMzQ3OSAyOC44MzY3IDM3LjM0NzkgMjkuNjEyNSAzNy4wNTY5QzMxLjM1ODIgMzYuNDc1IDMyLjMyOCAzNC40Mzg1IDMxLjY0OTEgMzIuNjkyOEMzMS4wNjcyIDMwLjk0NzIgMjkuMDMwNiAyOS45Nzc0IDI3LjI4NSAzMC42NTYyQzI2LjUwOTEgMzAuODUwMiAyNS45MjczIDMxLjQzMjEgMjUuNTM5MyAzMi4wMTRMMjUuNDQyNCAzMi4yMDc5QzI0LjU2OTUgMzMuNTY1NiAyMy4zMDg4IDM0LjYzMjQgMjEuNjYwMSAzNS4yMTQzQzE5LjEzODcgMzYuMTg0MSAxNi41MjAyIDM1LjY5OTIgMTQuNDgzNiAzNC4yNDQ1QzEyLjI1MzEgMzIuNDAxOSA5LjE0OTcgMzEuODIgNi4yNDAzIDMyLjg4NjhaIiBmaWxsPSIjMjY2Q0QzIi8+CjwvZz4KPC9zdmc+Cg==',
};

const wallets = [
  new PortkeyAAWallet({
    appName: APP_NAME,
    chainId: CHAIN_ID,
    autoShowUnlock: true,
    noNeedForConfirm: false,
    enableAcceleration: true,
  }),
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
  didConfig,
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
  {
    key: 'AssetsDemo',
    label: 'AssetsDemo',
    children: <AssetsDemo />,
  },
];
console.log(config);
const App: React.FC = () => {
  // const bridgeAPI = init(config);
  return (
    <WebLoginProvider config={config}>
      <LoginDemo />
      <Tabs defaultActiveKey="ContractDemo" items={items} />
    </WebLoginProvider>
  );
};

export default App;
