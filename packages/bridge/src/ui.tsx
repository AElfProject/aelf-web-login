import React, { useEffect, useRef, useState } from 'react';
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
    baseURL: '/v1',
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
const DemoButton = (props: any) => {
  const { bridgeInstance } = props;
  const [isShow, setIsSHow] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef(0);
  ref.current = count;

  function handleOnClick() {
    console.log('Button onClick');
    setIsSHow(!isShow);
  }
  useEffect(() => {
    const r = setInterval(() => {
      setCount(ref.current + 1);
    }, 2000);
    return () => {
      clearInterval(r);
    };
  }, []);

  return (
    <PortkeyProvider networkType="TESTNET" theme="dark">
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
            extraElementList={[<div onClick={bridgeInstance.connect}>login</div>]}
            onCancel={() => {
              console.log('onCancel');
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

        <button type="button" onClick={handleOnClick} {...props}>
          hi open
        </button>
      </div>
    </PortkeyProvider>
  );
};

export { DemoButton };
