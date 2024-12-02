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
    'data:image/png;base64,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';

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
