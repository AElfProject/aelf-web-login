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
import { zeroFill } from './utils';
import { isPortkeyApp } from '@aelf-web-login/utils';

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
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MSA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMC41IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI3LjUiIGZpbGw9IiM0QTdERkYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOC45Mjk0IDExLjI1MDNDMTUuMjYwMyAxMi44NjM4IDEyLjk1MjcgMTYuODA5OSAxNC4yOTYxIDIwLjczMTNDMTUuMTA4NSAyMy4xMDI3IDE2Ljc0NTUgMjQuNzkyNSAxOS4xNzMyIDI1LjY1NjJDMjMuNDE4NSAyNy4xNjY5IDI3Ljg1MDEgMjMuODQ1NCAyNy4zNTMxIDE5LjUyNzlDMjcuMTQyMSAxNy42OTMgMjYuMjEyNSAxNi4yOTU3IDI0LjMyNDYgMTUuNzE3NkMyMi45MjAzIDE1LjI4NzUgMjEuNTc2MyAxNS40ODg0IDIwLjQ3OTcgMTYuNTExNEMxOS41NDg5IDE3LjM3ODYgMTkuMTk2MSAxOC40NDY4IDE5LjU2ODkgMTkuNjg4M0MxOS43NzQ2IDIwLjM3MTEgMjAuMjY4NyAyMC43OTU5IDIwLjk0MSAyMC45OTg2QzIxLjUzMTIgMjEuMTc2MSAyMS45ODc4IDIwLjkxOTMgMjIuMzM5NCAyMC40MjgxQzIyLjI2ODUgMjAuMzA5NCAyMi4yMDY0IDIwLjE3OTUgMjIuMTIwMiAyMC4wNjc5QzIxLjY2MTMgMTkuNDczMyAyMi4wMzM1IDE4LjYwODQgMjIuNDMwMyAxOC4yNDgyQzIyLjk2OTUgMTcuNzU4OCAyMy44NDI4IDE3LjcxNDEgMjQuNDE2NiAxOC4xMTk1QzI1LjM0NzQgMTguNzc1OCAyNS43NzA2IDIwLjUyMTUgMjUuMjY0OCAyMS42MTY3QzI0LjQxODQgMjMuNDQ4OCAyMi4yNDIxIDI0LjUxNTIgMjAuMjQ1MiAyMy45OTY0QzE3LjA5MjUgMjMuMTc3MyAxNS41MzgxIDIwLjA1NjcgMTYuNTU1NiAxNy4wNDAyQzE3LjkwNzggMTMuMDMxOCAyMi40NTI2IDExLjI3ODUgMjYuMzI1NiAxMy4yMDFDMjkuNDU2NyAxNC43NTQ1IDMwLjYxOSAxNy40NjczIDMwLjQ5NDEgMjAuNjk2NkMzMC4yODk2IDI2LjAxMzUgMjQuOTM3NyAyOS45NTc4IDE5LjU3MTIgMjguOTMyNUMxNC4zNjY1IDI3LjkzODMgMTAuNTAxNiAyMi45NDIzIDEwLjc3ODggMTguMjE3N0MxMC44ODA4IDE2LjQ3MzIgMTEuMjY4MiAxNC44Mzk3IDEyLjE1ODUgMTMuMzQwOUMxNC40NzQ5IDkuNDQyOTUgMTguMDgzIDcuNjA4NTcgMjIuNTk2MiA3LjMxMTg1QzIzLjc4NDIgNy4yMzM3IDI0Ljk4MjMgNy4zMDAxIDI2LjExNCA3LjMwMDY5QzI2LjA1MTkgNy4yNzMwNyAyNS45MTAxIDcuMjAzMTUgMjUuNzYyNCA3LjE0NzkyQzIzLjU1ODYgNi4zMjA2MyAyMS4yODA5IDYuMDU2ODEgMTguOTQ3IDYuMzkwNTVDMTcuNDk5OSA2LjU2OTE3IDE2LjE2NDEgNi45NjEwNyAxNC45NDk2IDcuNTIxNjFDMTQuOTI3NCA3LjUyNTE0IDE0LjkwMSA3LjUzMjc3IDE0Ljg2ODggNy41NDYyOUMxNC4zMjI1IDcuNzc5NTUgMTQuMjMxMSA3LjI0MzY5IDE0LjAzNzEgNy4wODE1MkMxMy44NDgzIDYuOTI0MDYgMTMuODcyOSA3LjExOTcyIDEzLjg3MjkgNy4xMTk3MkMxNC4wMzc2IDcuOTA1MjkgMTMuNjI1IDguMjIxOTkgMTMuNTY5MyA4LjI2MDc3QzEzLjIyNTMgOC40NzQwNSAxMi44OTUzIDguNzA0MzggMTIuNTc2NCA4Ljk0NjQ2QzEyLjU2NzEgOC45NTA1NyAxMi41NiA4Ljk1MDU3IDEyLjU1MDEgOC45NTUyN0MxMS43OTY5IDkuMjk5NTggMTEuNDgzOSA4LjcxNzg5IDExLjEzNzUgOC41NDEwNEMxMC43NzEyIDguMzU0MTkgMTAuOTA5NSA4LjY2MDkgMTAuOTA5NSA4LjY2MDlDMTEuMzYzMiA5LjU2NDU4IDEwLjk3MTcgMTAuMzM3OCAxMC44OTg0IDEwLjQ2ODNDMTAuNTc3MiAxMC44MTU1IDEwLjI3NjUgMTEuMTgwNCA5Ljk5NTE4IDExLjU1OTRDOS45NjU4NyAxMS41NzgyIDkuOTM3MTUgMTEuNTk1OCA5LjkwMzc0IDExLjYyNThDOS4xNjQwNiAxMi4yOTYyIDguNTg4NDkgMTEuNzY1NiA4LjEzMTMxIDExLjY2NTdDNy42MjcyNSAxMS41NTY0IDcuOTEyNjkgMTEuODg3MiA3LjkxMjY5IDExLjg4NzJDOC44NDUyMSAxMi44NDQ0IDguNTUwMzkgMTMuOTk1NCA4LjU1MDM5IDEzLjk5NTRMOC41NTI3MyAxMy45OTY2QzcuMzU0NzEgMTYuNTkxOSA2LjkyNDQ5IDE5LjU5NTUgNy40MjIxMSAyMi42MTA5QzkuMDU3OTcgMzIuNTIyNSAyMS4yMTk0IDM3LjIwMzcgMjkuMTkxMiAzMC44MTg2QzMxLjc4MDEgMjguNzQ1MSAzMy41NzU5IDI0Ljc1MDggMzMuNzY1MyAyMS40NDYzQzMzLjkwMDEgMTkuMDk5NiAzMy4xNzYyIDE2Ljk2OTcgMzEuODQxNiAxNS4wNDEzQzI5LjAxMDEgMTAuOTQ5NSAyMy4zNTA1IDkuMzA2MDUgMTguOTI5NCAxMS4yNTAzIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

  private _loginState: LoginStateEnum;
  private _wallet: TWalletInfo | null;
  private _detectProvider: IPortkeyProvider | null;
  private _chainId: TChainId;
  private _config: IPortkeyDiscoverWalletAdapterConfig;
  private _contract: IContract;

  constructor(config: IPortkeyDiscoverWalletAdapterConfig) {
    super();
    this._loginState = LoginStateEnum.INITIAL;
    this._wallet = null;
    this._detectProvider = null;
    this._chainId = config.chainId;
    this._config = config;
    this._contract = null as any;
    this.detect().then(() => {
      this.autoRequestAccountHandler();
    });
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
