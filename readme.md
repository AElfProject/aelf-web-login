# aelf-web-login

## Install

```
yarn add aelf-web-login
```

## Usage

Imports: 

```ts
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';
import { WebLoginProvider, useWebLogin, WebLoginState } from 'aelf-web-login';
```

Configuration:

```ts
import { setGlobalConfig } from 'aelf-web-login';

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
```

Add Provider to your app:

```ts
<WebLoginProvider extraWallets={['portkey', 'elf']} connectEagerly autoShowUnlock={false}>
	<App /> 
</WebLoginProvider>
```

Use hook:

```ts
const { wallet, login, loginEagerly, logout, loginState, loginError, callContract } = useWebLogin();
```

Example:

```ts
const [result, setResult] = useState({});
const { wallet, login, loginEagerly, logout, loginState, loginError, callContract } = useWebLogin();

const onClickCall = async () => {
	try {
		const res = await callContract({
			contractAddress: configJson.tokenConverter,
			methodName: 'Buy',
			args: {
				symbol: configJson.SYMBOL,
				amount: 1,
			},
		});
		console.log(res);
		setResult(res);
	} catch (error) {
		console.log(error);
		setResult({ error: error.message });
	}
};

return (
	<div className="content">
		<h2>Login</h2>
		<div className="buttons">
			<div>wallet: {wallet.address}</div>
			<div>login state: {loginState}</div>
			<div>{loginError && <div>{/* login error: {loginError.message} */}</div>}</div>
			<br />
			<button disabled={loginState !== WebLoginState.initial} onClick={login}>
				login
			</button>
			<button disabled={loginState !== WebLoginState.eagerly} onClick={loginEagerly}>
				loginEagerly
			</button>
			<button disabled={loginState !== WebLoginState.lock} onClick={login}>
				unlock
			</button>
			<button disabled={loginState !== WebLoginState.logined} onClick={logout}>
				logout
			</button>
		</div>
		<br />
		<br />
		<h2>Contract:</h2>
		<div className="contract">
			<button disabled={loginState !== WebLoginState.logined} onClick={onClickCall}>
				Call contract
			</button>
			<div>
				<h3>Result</h3>
				<pre className="result">{JSON.stringify(result, null, '  ')}</pre>
			</div>
		</div>
	</div>
);
```