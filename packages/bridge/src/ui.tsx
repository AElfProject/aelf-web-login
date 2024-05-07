import React, { useState } from 'react';
import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';
import { Bridge } from './bridge';
import {
  CommonBaseModal,
  ConfigProvider,
  PortkeyLoading,
  PortkeyProvider,
  SignIn,
} from '@portkey/did-ui-react';

import '@portkey/did-ui-react/dist/assets/index.css';

import { GlobalConfigProps } from '@portkey/did-ui-react/dist/_types/src/components/config-provider/types';

const APPNAME = 'explorer.aelf.io';
const WEBSITE_ICON = 'https://explorer.aelf.io/favicon.main.ico';
const NETWORK = 'TESTNET';
const IS_MAINNET = false;

const graphQLServer = !IS_MAINNET
  ? 'https://dapp-portkey-test.portkey.finance'
  : 'https://dapp-portkey.portkey.finance';

// did.config.setConfig
export const connectUrl = !IS_MAINNET
  ? 'https://auth-portkey-test.portkey.finance'
  : 'https://auth-portkey.portkey.finance';

const portkeyScanUrl = `${graphQLServer}/Portkey_DID/PortKeyIndexerCASchema/graphql`;
const a = {
  useLocalStorage: true,
  graphQLUrl: portkeyScanUrl,
  connectUrl: connectUrl,
  requestDefaults: {
    baseURL: '/v2',
    timeout: 30000,
  },
  socialLogin: {
    Portkey: {
      websiteName: APPNAME,
      websiteIcon: WEBSITE_ICON,
    },
  },
  networkType: NETWORK,
} as GlobalConfigProps;
ConfigProvider.setGlobalConfig(a);

interface IProps {
  bridgeInstance: Bridge;
  wallets: WalletAdapter[];
}

const DemoButton = (props: IProps) => {
  const { bridgeInstance, wallets } = props;
  const [isShow, setIsSHow] = useState(false);
  const [loading, setLoading] = useState(false);

  bridgeInstance.openSignInModal = () => {
    setIsSHow(true);
  };

  bridgeInstance.closeSignIModal = () => {
    setIsSHow(false);
  };

  bridgeInstance.openLoadingModal = () => {
    setLoading(true);
  };

  bridgeInstance.closeLoadingModal = () => {
    setLoading(false);
  };

  return (
    <PortkeyProvider networkType="TESTNET">
      <div>
        <CommonBaseModal
          destroyOnClose
          // className={clsx('portkey-ui-sign-modal', `portkey-ui-sign-modal-${portkeyOpts.design}`)}
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          open={isShow}
        >
          <SignIn
            defaultChainId={'AELF'}
            uiType="Full"
            design={'CryptoDesign'}
            isShowScan
            extraElementList={wallets.map((item) => (
              <div key={item.name} onClick={() => bridgeInstance.onUniqueWalletClick(item.name)}>
                {item.name}
              </div>
            ))}
            onCancel={() => {
              console.log(11);
              setIsSHow(false);
            }}
            onError={() => {
              console.log('onErrorInternal');
            }}
            onFinish={() => {
              console.log('onFinishInternal');
            }}
            onSignUp={(identifierInfo: any) => {
              console.log(identifierInfo);
              return Promise.resolve(2);
            }}
          />
        </CommonBaseModal>

        <PortkeyLoading loading={loading} />

        {/* <button type="button" onClick={handleOnClick} {...props}>
          hi open
        </button> */}
      </div>
    </PortkeyProvider>
  );
};

export { DemoButton };
