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
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMyIgaGVpZ2h0PSIxNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzFGMUYyMSIgZD0iTTUuNzQyIDIuN2MtMS41NzEuNjktMi43MSAyLjU2LTIuMTUgNC42MzYuMzk0IDEuMTQ5IDEuMTQ1IDEuOTc3IDIuMzIzIDIuMzk1IDIuMDYxLjczMiA0LjI0OC0uODk5IDMuOTM1LTIuOTkxLS4xMzMtLjg5LS43MDQtMS40NzctMS40ODUtMS42OTUtLjY3LS4xNTctMS4zNDQtLjA0LTEuODMuNDIzYTEuNTA0IDEuNTA0IDAgMCAwLS40MjggMS4zNzNjLjEuMzMuMjYuNTM2LjY2Ny42MzUuMjIzLjA1NC41MSAwIC41OTctLjIwMy4wNi0uMTM3LjAwNC0uMjQ5LS4wMzYtLjM3OS0uMTEtLjM1My0uMDM5LS41NTYuMTU0LS43My4yNTgtLjI1Ni42OTctLjI2Ljk3Ni0uMDY0LjM1OC4xODMuNjQzLjc2Ny4zMDcgMS42NjUtLjM4NC45MjMtMS4zODUgMS4yMDEtMi4zMTguOTYtMS4zNS0uMzUtMi4wODUtMS44ODQtMS43NjEtMy4xMDNDNS4yMyAzLjU5MyA3LjQ5IDIuOTY2IDkuMzcgMy44OTdjMS4yNjkuNzE0IDIuMDYzIDEuODY3IDIuMDQgMy40MzItLjEgMi41NzUtMi43MDQgNC40NzQtNS4zMDkgMy45NzhhNS4yNzkgNS4yNzkgMCAwIDEtNC4yMjEtNS4wMzQgNS40MjcgNS40MjcgMCAwIDEgLjU3NS0yLjUzNkMzLjQ3NyAxLjgwNyA1LjI1Mi45MDMgNy41MTIuNzY4Yy41OTMtLjAzNSAxLjAyMyAwIDEuNzczLjA3NC0uMDMtLjAxMy0uMS0uMDQ3LS4xNy0uMDc0YTYuNjM1IDYuNjM1IDAgMCAwLTMuMzEtLjM2N0E2LjY5IDYuNjkgMCAwIDAgMy44OS45ODVjLS4yNTQuMDktLjI5Mi0uMTI2LS40ODgtLjI5LS4wOTEtLjA3Ni0uMDgyLjAyLS4wODIuMDIuMDguMzgxLS4wOTguNTczLS4xMjUuNTkyYTIuMDc5IDIuMDc5IDAgMCAxLS40ODIuMzMyYy0uMzI2LjE0My0uNDc3LS4wOTItLjczNy0uMjI0LS4xNzgtLjA5LS4xMDguMDYtLjEwOC4wNi4yMi40MzcuMDY2LjgzOC4wMy45MDEtLjE1MS4yMi0uMjc4LjM3Ni0uNDgzLjU2LS4zNTkuMzI1LS43ODUuMDEyLS45MTItLjAzNS0uMjQtLjA5LS4wNjYuMTE1LS4wNjYuMTE1LjA5NS4xMjYuNDQuODU1LjMzMiAxLjA4NmE2LjczOCA2LjczOCAwIDAgMC0uNTM4IDQuMTY0YzEgNS4wMDUgNi42ODggNi43NCAxMC4yMjggNC4zMjIgMS44NzgtMS4zODggMi41MTktMy41NDggMi41NC00Ljg5Ni4wMjEtMS4zNDctLjMxNy0yLjMyNi0uOTQzLTMuMkMxMC41NzMgMi40MTYgNy44ODggMS43NTggNS43NDIgMi43WiIvPjwvc3ZnPg==';
  darkIcon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMyIgaGVpZ2h0PSIxNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTUuNzQyIDIuN2MtMS41NzEuNjktMi43MSAyLjU2LTIuMTUgNC42MzYuMzk0IDEuMTQ5IDEuMTQ1IDEuOTc3IDIuMzIzIDIuMzk1IDIuMDYxLjczMiA0LjI0OC0uODk5IDMuOTM1LTIuOTkxLS4xMzMtLjg5LS43MDQtMS40NzctMS40ODUtMS42OTUtLjY3LS4xNTctMS4zNDQtLjA0LTEuODMuNDIzYTEuNTA0IDEuNTA0IDAgMCAwLS40MjggMS4zNzNjLjEuMzMuMjYuNTM2LjY2Ny42MzUuMjIzLjA1NC41MSAwIC41OTctLjIwMy4wNi0uMTM3LjAwNC0uMjQ5LS4wMzYtLjM3OS0uMTEtLjM1My0uMDM5LS41NTYuMTU0LS43My4yNTgtLjI1Ni42OTctLjI2Ljk3Ni0uMDY0LjM1OC4xODMuNjQzLjc2Ny4zMDcgMS42NjUtLjM4NC45MjMtMS4zODUgMS4yMDEtMi4zMTguOTYtMS4zNS0uMzUtMi4wODUtMS44ODQtMS43NjEtMy4xMDNDNS4yMyAzLjU5MyA3LjQ5IDIuOTY2IDkuMzcgMy44OTdjMS4yNjkuNzE0IDIuMDYzIDEuODY3IDIuMDQgMy40MzItLjEgMi41NzUtMi43MDQgNC40NzQtNS4zMDkgMy45NzhhNS4yNzkgNS4yNzkgMCAwIDEtNC4yMjEtNS4wMzQgNS40MjcgNS40MjcgMCAwIDEgLjU3NS0yLjUzNkMzLjQ3NyAxLjgwNyA1LjI1Mi45MDMgNy41MTIuNzY4Yy41OTMtLjAzNSAxLjAyMyAwIDEuNzczLjA3NC0uMDMtLjAxMy0uMS0uMDQ3LS4xNy0uMDc0YTYuNjM1IDYuNjM1IDAgMCAwLTMuMzEtLjM2N0E2LjY5IDYuNjkgMCAwIDAgMy44OS45ODVjLS4yNTQuMDktLjI5Mi0uMTI2LS40ODgtLjI5LS4wOTEtLjA3Ni0uMDgyLjAyLS4wODIuMDIuMDguMzgxLS4wOTguNTczLS4xMjUuNTkyYTIuMDc5IDIuMDc5IDAgMCAxLS40ODIuMzMyYy0uMzI2LjE0My0uNDc3LS4wOTItLjczNy0uMjI0LS4xNzgtLjA5LS4xMDguMDYtLjEwOC4wNi4yMi40MzcuMDY2LjgzOC4wMy45MDEtLjE1MS4yMi0uMjc4LjM3Ni0uNDgzLjU2LS4zNTkuMzI1LS43ODUuMDEyLS45MTItLjAzNS0uMjQtLjA5LS4wNjYuMTE1LS4wNjYuMTE1LjA5NS4xMjYuNDQuODU1LjMzMiAxLjA4NmE2LjczOCA2LjczOCAwIDAgMC0uNTM4IDQuMTY0YzEgNS4wMDUgNi42ODggNi43NCAxMC4yMjggNC4zMjIgMS44NzgtMS4zODggMi41MTktMy41NDggMi41NC00Ljg5Ni4wMjEtMS4zNDctLjMxNy0yLjMyNi0uOTQzLTMuMkMxMC41NzMgMi40MTYgNy44ODggMS43NTggNS43NDIgMi43WiIvPjwvc3ZnPg==';
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
}
