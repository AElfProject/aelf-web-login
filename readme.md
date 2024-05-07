# aelf-web-login - AELF Wallet

## 1. Introduction

Modular React wallet collection and components for aelf applications.

## 2. Getting Started

### 2.1 Adding aelf-web-login

First you need to get aelf-web-login into your project. This can be done using the following methods:

npm: `npm install aelf-web-login`

yarn: `yarn add aelf-web-login`

pnpm: `pnpm install aelf-web-login`

### 2.2 Basic usage

- Set Global Config.

```javascript
import { setGlobalConfig } from 'aelf-web-login';

const APPNAME = 'explorer.aelf.io';
const WEBSITE_ICON = 'https://explorer.aelf.io/favicon.main.ico';
const CHAIN_ID = 'AELF';
const NETWORK: string = 'TESTNET';
const RPC_SERVER = 'https://explorer.aelf.io/chain';

const IS_MAINNET = NETWORK === 'MAIN';

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

const portkeyScanUrl = `${graphQLServer}/Portkey_DID/PortKeyIndexerCASchema/graphql`;

setGlobalConfig({
  appName: APPNAME,
  chainId: CHAIN_ID,
  networkType: NETWORK as any,
  portkey: {
    useLocalStorage: true,
    graphQLUrl: portkeyScanUrl,
    connectUrl: connectUrl,
    socialLogin: {
      Portkey: {
        websiteName: APPNAME,
        websiteIcon: WEBSITE_ICON,
      },
    }，
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
        rpcUrl: RPC_SERVER,
      },
    },
  },
});
```

- Add WebLoginProvider

```javascript
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';
import {
  WebLoginProvider,
  WebLoginState,
  useWebLogin,
  useLoginState,
  useWebLoginEvent,
  WebLoginEvents,
} from 'aelf-web-login';

<PortkeyConfigProvider>
    <WebLoginProvider prop={prop} >
        <App>
    </WebLoginProvider>
</PortkeyConfigProvider>
```

- Get props or functions by useWebLogin

```javascript
const {
	loginId,
	wallet,
	loginState,
	login,
	loginEargly,
	switchWallet,
	logout,
	getSignature,
	callContract,
	loginError,
	version,
} = useWebLogin();
```

- Call contract

```javascript
const { wallet, callContract } = useWebLogin();

async function buyWrite() {
	await callContract({
		contractAddress: tokenConverterAddr,
		methodName: 'Buy',
		args: {
			symbol: 'WRITE',
			amount: 10 * decimals,
		},
	});
}
```

- Status of login button

```javascript
const { loginState, login } = useWebLogin();

const onClickLogin = () => {
  // handle your logic
  // ...
  login();
}

 useEffect(() => {
  if(loginState === WebLoginState.logined) {
    // handle success callback
  }
 }, [loginState])

<Button
  onClick={onClickLogin}
  style={{
      display: loginState === WebLoginState.logined ? 'none' : ''
  }}
  loading={loginState === WebLoginState.logining}
/>
```

### 3.Run the demo

First you need to run aelf-web-login in development mode. This can be done using the following methods:

npm: `npm run login:dev`

yarn: `yarn run login:dev`

pnpm: `pnpm run login:dev`

Then you can run demo project.This can be done using the following methods:

npm: `npm run example`

yarn: `yarn run example`

pnpm: `pnpm run example`

### 4.Publish

Authorized individuals can publish to npm.This can be done using the following methods:

npm: `npm run login:pub`

yarn: `yarn run login:pub`

pnpm: `pnpm run login:pub`
