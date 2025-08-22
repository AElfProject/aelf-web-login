import {
  BaseWalletAdapter,
  LoginStateEnum,
  makeError,
  ERR_CODE,
  TWalletInfo,
  WalletName,
  TSignatureParams,
  ConnectedWallet,
  TWalletError,
  utils,
  TChainId,
  ICallContractParams,
  enhancedLocalStorage,
} from '@aelf-web-login/wallet-adapter-base';
import {
  Accounts,
  IPortkeyProvider,
  NetworkType,
  ProviderError,
  ChainIds,
  DappEvents,
  // MethodsWallet,
} from '@portkey/provider-types';
import { getContractBasic } from '@portkey/contracts';
import { IContract } from '@portkey/types';

import detectDiscoverProvider from './detectProvider';
import checkSignatureParams from './signatureParams';
import { zeroFill, openPageInDiscover } from './utils';

const { isMobileDevices, isFairyVaultApp } = utils;

type TDiscoverEventsKeys = Array<Exclude<DappEvents, 'connected' | 'message' | 'error'>>;

export type TPluginNotFoundCallback = (openPluginStorePage: () => void) => void;
export type TOnClickCryptoWallet = (continueDefaultBehaviour: () => void) => void;
export interface IPortkeyDiscoverWalletAdapterConfig {
  networkType: NetworkType;
  chainId: TChainId;
  autoRequestAccount: boolean;
  autoLogoutOnDisconnected: boolean;
  autoLogoutOnNetworkMismatch: boolean;
  autoLogoutOnAccountMismatch: boolean;
  autoLogoutOnChainMismatch: boolean;
  onClick?: TOnClickCryptoWallet;
  onPluginNotFound?: TPluginNotFoundCallback;
}

// autoRequestAccount: true,
// autoLogoutOnAccountMismatch: true,
// autoLogoutOnChainMismatch: true,
// autoLogoutOnDisconnected: true,
// autoLogoutOnNetworkMismatch: true,
// onClick: continueDefaultBehaviour => {
//   continueDefaultBehaviour();
// },
// onPluginNotFound: openStore => {
//   console.log(234);
//   openStore();
// }

export const DISCOVER_NAME = 'FairyVaultDiscover' as WalletName<'FairyVaultDiscover'>;

// export class PortkeyDiscoverWallet extends BaseWalletAdapter {
export class FairyVaultDiscoverWallet extends BaseWalletAdapter {
  name = DISCOVER_NAME;
  icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODEiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MSA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMC41IiB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxNy43Nzc4IiBmaWxsPSIjOEI2NEU3Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzkuNDA3NyAxNC43MDYxTDM5LjM4ODggMjAuODYzOUMzOS4zNzcgMjQuNzY3MyAzOC45Mjc0IDI4Ljg0NzMgMzYuNDM0NyAzMS44NTEyQzM0LjQ5OTUgMzQuMTgzMyAzMS45Njc4IDM1Ljk5ODIgMjkuMDYyMiAzNy4wNzM1TDI1LjExMDMgMzguNTM2TDI5LjA2MjIgMzkuOTk4NUMzMy44MzggNDEuNzY1OSAzNy42MDM1IDQ1LjUzMTQgMzkuMzcwOSA1MC4zMDcyTDQwLjgzMzQgNTQuMjU5MUw0Mi4yOTU5IDUwLjMwNzJDNDQuMDYzMyA0NS41MzE0IDQ3LjgyODggNDEuNzY1OSA1Mi42MDQ2IDM5Ljk5ODVMNTYuNTU2NSAzOC41MzZMNTIuNjA0NiAzNy4wNzM1QzQ5LjY5OSAzNS45OTgyIDQ3LjE2NzMgMzQuMTgzMyA0NS4yMzIxIDMxLjg1MTJDNDIuNzM5NCAyOC44NDczIDQyLjI4OTggMjQuNzY3MyA0Mi4yNzggMjAuODYzOUw0Mi4yNTkxIDE0LjcwNjFMNDMuODIzNyAxNi4wMTgzQzUwLjM5NDIgMjEuNTI5MiA1OS4wMyAyMy45MjMyIDY3LjUwMDEgMjIuNTgxNkw2Ni44NzMyIDI4LjU4MjFDNjUuMTY0NSA0NC45MzcxIDU1LjM5MjEgNTkuMzU0OSA0MC44MzM0IDY3QzI2LjMxMTEgNTkuNjY2NCAxNi41MjEgNDUuNDQ0NCAxNC44NTQ1IDI5LjI2MUwxNC4xNjY3IDIyLjU4MTZDMjIuNjM2OCAyMy45MjMyIDMxLjI3MjcgMjEuNTI5MiAzNy44NDMyIDE2LjAxODNMMzkuNDA3NyAxNC43MDYxWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';
  private _loginState: LoginStateEnum;
  private _wallet: TWalletInfo | null;
  private _detectProvider: IPortkeyProvider | null;
  private _chainId: TChainId;
  private _config: IPortkeyDiscoverWalletAdapterConfig;

  constructor(config: IPortkeyDiscoverWalletAdapterConfig) {
    super();
    this._loginState = LoginStateEnum.INITIAL;
    this._wallet = null;
    this._detectProvider = null;
    this._chainId = config.chainId;
    this._config = config;
    if (typeof window !== 'undefined') {
      this.detect().then(() => {
        this.autoRequestAccountHandler();
      });
    }
  }

  get loginState() {
    return this._loginState;
  }

  get wallet() {
    return this._wallet as TWalletInfo;
  }

  async autoRequestAccountHandler() {
    if (!this._config.autoRequestAccount) {
      return;
    }
    const canLoginEargly =
      enhancedLocalStorage.getItem(ConnectedWallet) === this.name || isFairyVaultApp();
    if (canLoginEargly) {
      console.log('this._config.autoRequestAccount', this._config.autoRequestAccount);
      await this.loginEagerly();
    }
  }

  // private executeOnce<T extends (...args: any) => any>(fn: T) {
  //   if (typeof fn !== 'function') {
  //     throw new Error('please pass a function');
  //   }
  //   let result: ReturnType<T>;
  //   return (...rest: any) => {
  //     if (fn) {
  //       result = fn.apply(this, rest);
  //       fn = null as any;
  //     }
  //     return result;
  //   };
  // }

  private async detect(): Promise<IPortkeyProvider> {
    if (this._detectProvider?.isConnected()) {
      return this._detectProvider;
    }
    this._detectProvider = await detectDiscoverProvider();
    if (this._detectProvider) {
      if (!this._detectProvider.isPortkey) {
        throw makeError(ERR_CODE.NOT_PORTKEY);
      }
      this.listenProviderEvents();
      return this._detectProvider;
    } else {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
  }

  private async onAccountsSuccess(
    provider: IPortkeyProvider,
    accounts: Accounts,
  ): Promise<TWalletInfo> {
    let nickName = 'Wallet 01';
    const address = accounts[this._chainId]![0].split('_')[1];
    try {
      nickName = await provider.request({ method: 'wallet_getWalletName' });
    } catch (error) {
      console.warn(error);
    }
    this._wallet = {
      address,
      extraInfo: {
        accounts,
        nickName,
        provider,
      },
    };
    console.log('_wallet', this._wallet);
    this._loginState = LoginStateEnum.CONNECTED;
    enhancedLocalStorage.setItem(ConnectedWallet, this.name);
    this.emit('connected', this._wallet);
    return this._wallet;
  }

  private onAccountsFail(err: TWalletError) {
    throw err;
  }

  async login(): Promise<TWalletInfo> {
    if (isMobileDevices() && !isFairyVaultApp()) {
      openPageInDiscover(undefined, undefined);
      return;
    }
    try {
      if (!this._detectProvider) {
        throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
      }

      const provider = this._detectProvider;
      const chainId = this._chainId;

      this._loginState = LoginStateEnum.CONNECTING;

      const network = await provider.request({ method: 'network' });
      console.log('network', network);
      if (network !== this._config.networkType) {
        this.onAccountsFail(makeError(ERR_CODE.NETWORK_TYPE_NOT_MATCH));
        return;
      }

      let accounts = await provider.request({ method: 'accounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        return await this.onAccountsSuccess(provider, accounts);
      }
      accounts = await provider.request({ method: 'requestAccounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        return await this.onAccountsSuccess(provider, accounts);
      } else {
        this.onAccountsFail(makeError(ERR_CODE.ACCOUNTS_IS_EMPTY));
        return;
      }
    } catch (error) {
      this._loginState = LoginStateEnum.INITIAL;
      this.emit('error', makeError(ERR_CODE.DISCOVER_LOGIN_FAIL, error));
      return;
    }
  }

  async loginEagerly() {
    try {
      if (!this._detectProvider) {
        throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
      }

      const provider = this._detectProvider;
      const chainId = this._chainId;

      this._loginState = LoginStateEnum.CONNECTING;

      const { isUnlocked } = await provider.request({ method: 'wallet_getWalletState' });

      console.log('isUnlocked', isUnlocked);
      if (!isUnlocked) {
        console.log('portkey-discover-loginEagerly-locked');
        return;
      }

      const network = await provider.request({ method: 'network' });
      if (network !== this._config.networkType) {
        this.onAccountsFail(makeError(ERR_CODE.NETWORK_TYPE_NOT_MATCH));
        return;
      }

      const accounts = await provider.request({ method: 'accounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        await this.onAccountsSuccess(provider, accounts);
      } else {
        this.onAccountsFail(makeError(ERR_CODE.DISCOVER_LOGIN_EAGERLY_FAIL));
      }
    } catch (error) {
      this.emit('error', makeError(ERR_CODE.DISCOVER_LOGIN_EAGERLY_FAIL, error));
    }
  }

  async logout() {
    this._wallet = null;
    this._loginState = LoginStateEnum.INITIAL;
    enhancedLocalStorage.removeItem(ConnectedWallet);
    this.emit('disconnected');
  }

  async getSignature(params: TSignatureParams): Promise<{
    error: number;
    errorMessage: string;
    signature: string;
    from: string;
  }> {
    checkSignatureParams(params);
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!this._detectProvider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }

    const signInfo = params.signInfo;
    const signedMsgObject = await this._detectProvider.request({
      method: 'wallet_getSignature',
      payload: {
        data: signInfo || params.hexToBeSign,
      },
    });
    const signedMsgString = [
      zeroFill(signedMsgObject.r),
      zeroFill(signedMsgObject.s),
      `0${signedMsgObject.recoveryParam!.toString()}`,
    ].join('');
    return {
      error: 0,
      errorMessage: '',
      signature: signedMsgString,
      from: 'discover',
    };
  }

  async getAccountByChainId(chainId: TChainId): Promise<string> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!this._detectProvider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    let accounts = this._wallet.extraInfo?.accounts;
    if (!accounts[chainId] || accounts[chainId]?.length === 0) {
      accounts = await this._detectProvider.request({ method: 'accounts' });
    }
    return accounts[chainId]?.[0];
  }

  async getWalletSyncIsCompleted(chainId?: TChainId): Promise<string | boolean> {
    console.log(chainId, this._wallet, this._detectProvider, 'getWalletSyncIsCompleted===');
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!this._detectProvider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    return true;
  }

  private listenProviderEvents() {
    if (!this._detectProvider) {
      return;
    }
    const onDisconnected = (error: ProviderError) => {
      console.log('onDisconnected', error);
      if (!this._wallet) return;
      if (this._config.autoLogoutOnDisconnected) {
        this.logout();
      }
    };
    const onNetworkChanged = (networkType: NetworkType) => {
      if (networkType !== this._config.networkType) {
        if (this._config.autoLogoutOnNetworkMismatch) {
          this.logout();
        }
      }
    };
    const onAccountsChanged = (accounts: Accounts) => {
      // console.log('onAccountsChanged accounts', accounts);
      // console.log('onAccountsChanged _chainId', this._chainId);
      // console.log('onAccountsChanged _wallet', this._wallet);
      if (!this._wallet) return;
      const chainId = this._chainId;
      // console.log(
      //   'onAccountsChanged boolean',
      //   !accounts[chainId] || accounts[chainId]!.length === 0,
      // );
      if (
        !accounts[chainId] ||
        accounts[chainId]!.length === 0
        // ||
        // accounts[chainId]!.find((addr) => addr !== this._wallet!.address)
      ) {
        if (this._config.autoLogoutOnAccountMismatch) {
          this.logout();
          return;
        }
      }
      if (!this._detectProvider) {
        return;
      }
      this.onAccountsSuccess(this._detectProvider, accounts);
    };
    const onChainChanged = (chainIds: ChainIds) => {
      if (chainIds.find((id) => id === this._chainId)) {
        if (this._config.autoLogoutOnChainMismatch) {
          this.logout();
        }
      }
    };

    const discoverEventsMap = {
      disconnected: onDisconnected,
      networkChanged: onNetworkChanged,
      accountsChanged: onAccountsChanged,
      chainChanged: onChainChanged,
      // TODO: 2.4.0-alpha.12 add  webWalletVisible
      webWalletVisible: () => {
        console.log('NOTE: webWalletVisible, version >= 2.4.0-alpha.12, do nothing here');
      },
    };
    (Object.keys(discoverEventsMap) as TDiscoverEventsKeys).forEach((ele) => {
      this._detectProvider?.on(ele, discoverEventsMap[ele]);
    });
  }

  async getContract(chainId: TChainId, contractAddress: string): Promise<IContract> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!this._detectProvider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    const chain = await this._detectProvider.getChain(chainId);
    return getContractBasic({
      contractAddress: contractAddress,
      chainProvider: chain,
    });
  }

  async callSendMethod<T, R>({
    chainId,
    contractAddress,
    methodName,
    args,
    sendOptions,
  }: ICallContractParams<T>) {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!this._detectProvider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    if (!contractAddress) {
      throw makeError(ERR_CODE.INVALID_CONTRACT_ADDRESS);
    }
    const finalChainId = chainId || this._chainId;
    const contract = await this.getContract(finalChainId, contractAddress);
    const rs = contract.callSendMethod(methodName, this._wallet.address, args, sendOptions);
    return rs as R;
  }

  async callViewMethod<T, R>({
    chainId,
    contractAddress,
    methodName,
    args,
  }: ICallContractParams<T>) {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!this._detectProvider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    if (!contractAddress) {
      throw makeError(ERR_CODE.INVALID_CONTRACT_ADDRESS);
    }
    const finalChainId = chainId || this._chainId;
    const contract = await this.getContract(finalChainId, contractAddress);
    const rs = contract.callViewMethod(methodName, args);
    return rs as R;
  }

  goAssets(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
