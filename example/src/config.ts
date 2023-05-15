import { ConfigProvider } from '@portkey/did-ui-react';
import { IStorageSuite } from '@portkey/types/dist/storage';

export class Store implements IStorageSuite {
  async getItem(key: string) {
    return localStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    return localStorage.removeItem(key);
  }
}

const IS_MAINNET = false;

ConfigProvider.setGlobalConfig({
  storageMethod: new Store(),
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
});
