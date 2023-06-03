import { setGlobalConfig } from 'aelf-web-login';
import { did } from '@portkey/did-ui-react';

const IS_MAINNET = false;

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

setGlobalConfig({
  appName: 'explorer.aelf.io',
  chainId: 'AELF',
  portkey: {
    useLocalStorage: true,
    graphQLUrl: `${graphQLServer}/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql`,
    connectUrl: connectUrl,
    socialLogin: {
      Portkey: {
        websiteName: 'explorer.aelf.io',
        websiteIcon: 'https://explorer.aelf.io/favicon.main.ico',
      },
    },
    network: {
      defaultNetwork: IS_MAINNET ? 'MAIN' : 'TESTNET',
      networkList: [
        {
          name: 'aelf MAIN',
          walletType: 'aelf',
          networkType: IS_MAINNET ? 'MAIN' : 'TESTNET',
          isActive: true,
          apiUrl: portkeyApiServer,
          graphQLUrl: `${graphQLServer}/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql`,
          connectUrl: connectUrl,
        },
      ],
    },
  } as any,
  aelfReact: {
    appName: 'explorer.aelf.io',
    nodes: IS_MAINNET
      ? {
          AELF: {
            chainId: 'AELF',
            rpcUrl: 'https://explorer.aelf.io/chain',
          },
        }
      : {
          AELF: {
            chainId: 'AELF',
            rpcUrl: 'https://explorer.aelf.io/chain',
          },
        },
  },
});

console.log(did.connectRequest);
