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
  MethodsWallet,
} from '@portkey/provider-types';
import { getContractBasic } from '@portkey/contracts';
import { IContract } from '@portkey/types';

import detectDiscoverProvider from './detectProvider';
import checkSignatureParams from './signatureParams';
import { zeroFill, openPageInDiscover } from './utils';

const { isPortkeyApp, isMobileDevices } = utils;

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

export const PortkeyDiscoverName = 'PortkeyDiscover' as WalletName<'PortkeyDiscover'>;

export class PortkeyDiscoverWallet extends BaseWalletAdapter {
  name = PortkeyDiscoverName;
  icon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjQjhFMUZGIiByeD0iOCIvPjxwYXRoIGZpbGw9IiMwQTQzNzAiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE0LjczMSA4LjQ1Yy0zLjA3MiAxLjM1LTQuNzUgNC44MzktMy45MjEgOC4xNjcuNjggMS45ODYgMi4wNSAzLjQgNC4wODMgNC4xMjQgMy43MS45MDkgNy4xODEtMS4xMjggNi44NS01LjEzMS0uMTc3LTEuNTM3LTEuMjE0LTIuNzg2LTIuNTM2LTMuMTktMS4xNzYtLjM2LTIuNDQtLjA2Mi0zLjIyLjY2NC0uNzguNzI2LTEuMDc1IDEuNjItLjc2MiAyLjY2LjE3Mi41NzIuNTg1LjkyNyAxLjE0OCAxLjA5Ny41Mi4wNDYgMS4wNDYtLjE3NyAxLjE3MS0uNDc4LS4wNTktLjA5OS0uMTExLS4yMDgtLjE4My0uMzAxLS4zNS0uNjI1LS4wNzMtMS4yMjIuMjYtMS41MjQuNDUxLS40MSAxLjE0OC0uMzkyIDEuNjI4LS4wNTMuNzguNTUgMS4wNjMgMS45MDUuNjQgMi44MjItLjcxIDEuNTM0LTIuMzMyIDIuMTQ1LTQuMDA0IDEuNzEtMi40NjQtLjY0LTMuNjY0LTMuNDA3LTIuOTcyLTUuNDU4IDEuMTMyLTMuMzU3IDQuODQ2LTQuNTY2IDcuOTY5LTMuMjQ3IDIuMzkgMS4yNyAzLjQ5IDMuMzA1IDMuNDkgNi4yNzYtLjE3IDQuNDUyLTQuNjUyIDcuNzU1LTkuMTQ2IDYuODk2LTQuMzU3LS44MzItNy41OTQtNS4wMTYtNy4zNjEtOC45NzEuMDg1LTEuNDYxLjQxLTIuODI5IDEuMTU1LTQuMDg0IDEuOTQtMy4yNjQgNC45Ni00LjggOC43NC01LjA0OC45OTQtLjA2NSAyLjAyMy0uMDQ0IDIuOTctLjA0M2E4LjAwMSA4LjAwMSAwIDAgMC0uMzIzLS4xMjljLTEuNjk3LS42NTQtMy43OTctLjg5Mi01LjcwMy0uNi0xLjIxMi4xNS0yLjMzLjQ3OC0zLjM0Ny45NDhhLjMuMyAwIDAgMC0uMDY4LjAyYy0uNDU3LjE5Ni0uNTM0LS4yNTMtLjY5Ni0uMzg5LS4xNTgtLjEzMi0uMTM4LjAzMi0uMTM4LjAzMi4xMzguNjU4LS4yMDcuOTIzLS4yNTQuOTU2LS4yODguMTc4LS41NjQuMzcxLS44MzEuNTc0LS4wMDguMDAzLS4wMTQuMDAzLS4wMjIuMDA3LS42My4yODgtLjg5My0uMTk5LTEuMTgzLS4zNDctLjMwNy0uMTU2LS4xOS4xLS4xOS4xLjM3OS43NTcuMDUxIDEuNDA1LS4wMSAxLjUxNC0uMjcuMjktLjUyMS41OTYtLjc1Ny45MTQtLjAyNC4wMTUtLjA0OC4wMy0uMDc2LjA1NS0uNjIuNTYyLTEuMTAxLjExNy0xLjQ4NC4wMzQtLjQyMi0uMDkyLS4xODMuMTg1LS4xODMuMTg1Ljc4LjgwMi41MzQgMS43NjUuNTM0IDEuNzY1LS45OCAyLjA2LTEuMzg1IDQuNjQ1LS45MTMgNy4yMTMgMS43OCA4Ljg0NCAxMS43NCAxMS44OCAxOC4yMTMgNy4wMDcgMi41OTgtMi4xNiAzLjgxMi00Ljk0IDMuODEyLTcuOTgxIDAtMi4wMzUtLjY0LTQuMjI2LTEuNTgxLTUuNDU1LTEuMS0xLjc3NC0zLjE1OC0zLjMyMS01LjQ5NC0zLjgzNWE4Ljc3NSA4Ljc3NSAwIDAgMC01LjMwNS41MjRaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=';
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
      enhancedLocalStorage.getItem(ConnectedWallet) === this.name || isPortkeyApp();
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
    if (isMobileDevices() && !isPortkeyApp()) {
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

  async getWalletSyncIsCompleted(chainId: TChainId): Promise<string | boolean> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!this._detectProvider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    const { getOriginalAddress } = utils;
    try {
      const status = await this._detectProvider?.request({
        method: MethodsWallet.GET_WALLET_MANAGER_SYNC_STATUS,
        payload: { chainId: chainId },
      });
      if (status) {
        const address = await this.getAccountByChainId(chainId);
        return getOriginalAddress(address);
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
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
      if (!this._wallet) return;
      const chainId = this._chainId;
      if (
        !accounts[chainId] ||
        accounts[chainId]!.length === 0 ||
        accounts[chainId]!.find((addr) => addr !== this._wallet!.address)
      ) {
        if (this._config.autoLogoutOnAccountMismatch) {
          this.logout();
        }
      }
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
