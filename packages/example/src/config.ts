import { setGlobalConfig } from 'aelf-web-login';

const APPNAME = 'explorer.aelf.io';
const WEBSITE_ICON = 'https://explorer.aelf.io/favicon.main.ico';
const CHAIN_ID = 'AELF';
const NETWORK: string = 'TESTNET';
const IS_MAINNET = true; //NETWORK === 'MAIN';
// portkey ip docs: https://hoopox.feishu.cn/wiki/GjdWwSqc3imGYxkE85bc8KEFnFd
const RPC_SERVER = 'https://explorer.aelf.io/chain';

const graphQLServer = !IS_MAINNET
  ? 'https://dapp-portkey-test.portkey.finance'
  : 'https://dapp-portkey.portkey.finance';

const portkeyApiServer = !IS_MAINNET
  ? 'https://did-portkey-test.portkey.finance'
  : 'https://did-portkey.portkey.finance';

// did.config.setConfig
export const connectUrl = !IS_MAINNET
  ? 'https://auth-portkey-test.portkey.finance'
  : 'https://auth-portkey.portkey.finance';

let portkeyScanUrl = `${graphQLServer}/Portkey_DID/PortKeyIndexerCASchema/graphql`;
// portkeyScanUrl = '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql';
let version = '2';
export const getVersion = () => {
  return version;
};
export const setVersion = (v: string) => {
  version = v;
};
setGlobalConfig({
  version,
  appName: APPNAME,
  chainId: CHAIN_ID,
  networkType: NETWORK as any,
  defaultRpcUrl: RPC_SERVER,
  portkey: {
    useLocalStorage: true,
    graphQLUrl: portkeyScanUrl,
    connectUrl: connectUrl,
    requestDefaults: {
      baseURL: portkeyApiServer,
      timeout: 30000,
    },
    socialLogin: {
      Portkey: {
        websiteName: APPNAME,
        websiteIcon: WEBSITE_ICON,
      },
    },
  } as any,
  aelfReact: {
    appName: APPNAME,
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
  },
});
