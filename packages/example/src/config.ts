import { setGlobalConfig } from '@aelf-web-login/login';

const IS_MAINNET = false;

setGlobalConfig({
  appName: 'explorer.aelf.io',
  chainId: 'AELF',
  portkey: {
    useLocalStorage: true,
    graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
    // reCaptchaConfig: {
    //   siteKey: '6LfR_bElAAAAAJSOBuxle4dCFaciuu9zfxRQfQC0',
    // },
    socialLogin: {
      Apple: {
        clientId: 'did.portkey',
        redirectURI: 'https://apple-bingo.portkey.finance/api/app/appleAuth/bingoReceive',
      },
      Google: {
        clientId: '176147744733-a2ks681uuqrmb8ajqrpu17te42gst6lq.apps.googleusercontent.com',
      },
      Portkey: {
        websiteName: 'Bingo Game',
        websiteIcon: '​https://bingogame.portkey.finance/favicon.ico',
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
          apiUrl: '',
          graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
          connectUrl: '',
        },
      ],
    },
  },
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
