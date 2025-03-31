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

import detectWebProvider from './detectProvider';
import checkSignatureParams from './signatureParams';
import { zeroFill } from './utils';
import { WalletInfoControl } from '@portkey/connect-web-wallet';
import { wallet } from '@portkey/utils';
import '@portkey/connect-web-wallet/dist/assets/index.css';
export * from '@portkey/connect-web-wallet';

type TDiscoverEventsKeys = Array<
  Exclude<DappEvents, 'connected' | 'message' | 'error' | 'webWalletVisible'>
>;

export type TPluginNotFoundCallback = (openPluginStorePage: () => void) => void;
export type TOnClickCryptoWallet = (continueDefaultBehaviour: () => void) => void;
export interface IPortkeyWebWalletAdapterConfig {
  networkType: NetworkType;
  chainId: TChainId;
  disconnectConfirm?: boolean;
}

export const WALLET_NAME = 'PortkeyWebWallet' as WalletName<'PortkeyWebWallet'>;

export class PortkeyInnerWallet extends BaseWalletAdapter {
  name = WALLET_NAME;
  icon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMDA3NkNDIiByeD0iOCIvPjxwYXRoIGZpbGw9IiNERkYwRkYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE0LjczMSA4LjQ1Yy0zLjA3MiAxLjM1LTQuNzUgNC44MzktMy45MjEgOC4xNjcuNjggMS45ODYgMi4wNSAzLjQgNC4wODMgNC4xMjQgMy43MS45MDkgNy4xODEtMS4xMjggNi44NS01LjEzMS0uMTc3LTEuNTM3LTEuMjE0LTIuNzg2LTIuNTM2LTMuMTktMS4xNzYtLjM2LTIuNDQtLjA2Mi0zLjIyLjY2NC0uNzguNzI2LTEuMDc1IDEuNjItLjc2MiAyLjY2LjE3Mi41NzIuNTg1LjkyNyAxLjE0OCAxLjA5Ny41Mi4wNDYgMS4wNDYtLjE3NyAxLjE3MS0uNDc4LS4wNTktLjA5OS0uMTExLS4yMDgtLjE4My0uMzAxLS4zNS0uNjI1LS4wNzMtMS4yMjIuMjYtMS41MjQuNDUxLS40MSAxLjE0OC0uMzkyIDEuNjI4LS4wNTMuNzguNTUgMS4wNjMgMS45MDUuNjQgMi44MjItLjcxIDEuNTM0LTIuMzMyIDIuMTQ1LTQuMDA0IDEuNzEtMi40NjQtLjY0LTMuNjY0LTMuNDA3LTIuOTcyLTUuNDU4IDEuMTMyLTMuMzU3IDQuODQ2LTQuNTY2IDcuOTY5LTMuMjQ3IDIuMzkgMS4yNyAzLjQ5IDMuMzA1IDMuNDkgNi4yNzYtLjE3IDQuNDUyLTQuNjUyIDcuNzU1LTkuMTQ2IDYuODk2LTQuMzU3LS44MzItNy41OTQtNS4wMTYtNy4zNjEtOC45NzEuMDg1LTEuNDYxLjQxLTIuODI5IDEuMTU1LTQuMDg0IDEuOTQtMy4yNjQgNC45Ni00LjggOC43NC01LjA0OC45OTQtLjA2NSAyLjAyMy0uMDQ0IDIuOTctLjA0M2E3Ljk5IDcuOTkgMCAwIDAtLjMyMy0uMTI5Yy0xLjY5Ny0uNjU0LTMuNzk3LS44OTItNS43MDMtLjYtMS4yMTIuMTUtMi4zMy40NzgtMy4zNDcuOTQ4YS4yOTkuMjk5IDAgMCAwLS4wNjguMDJjLS40NTcuMTk2LS41MzQtLjI1My0uNjk2LS4zODktLjE1OC0uMTMyLS4xMzguMDMyLS4xMzguMDMyLjEzOC42NTgtLjIwNy45MjMtLjI1NC45NTYtLjI4OC4xNzgtLjU2NC4zNzEtLjgzMS41NzQtLjAwOC4wMDMtLjAxNC4wMDMtLjAyMi4wMDctLjYzLjI4OC0uODkzLS4xOTktMS4xODMtLjM0Ny0uMzA3LS4xNTYtLjE5LjEtLjE5LjEuMzc5Ljc1Ny4wNTEgMS40MDUtLjAxIDEuNTE0LS4yNy4yOS0uNTIxLjU5Ni0uNzU3LjkxNC0uMDI0LjAxNS0uMDQ4LjAzLS4wNzYuMDU1LS42Mi41NjItMS4xMDEuMTE3LTEuNDg0LjAzNC0uNDIyLS4wOTItLjE4My4xODUtLjE4My4xODUuNzguODAyLjUzNCAxLjc2NS41MzQgMS43NjUtLjk4IDIuMDYtMS4zODUgNC42NDUtLjkxMyA3LjIxMyAxLjc4IDguODQ0IDExLjc0IDExLjg4IDE4LjIxMyA3LjAwNyAyLjU5OC0yLjE2IDMuODEyLTQuOTQgMy44MTItNy45ODEgMC0yLjAzNS0uNjQtNC4yMjYtMS41ODEtNS40NTUtMS4xLTEuNzc0LTMuMTU4LTMuMzIxLTUuNDk0LTMuODM1YTguNzc1IDguNzc1IDAgMCAwLTUuMzA1LjUyNFoiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==';
  private _loginState: LoginStateEnum;
  private _wallet: TWalletInfo | null;
  private _detectProvider: IPortkeyProvider | null;
  private _chainId: TChainId;
  private _config: IPortkeyWebWalletAdapterConfig;

  constructor(config: IPortkeyWebWalletAdapterConfig) {
    super();
    this._loginState = LoginStateEnum.INITIAL;
    this._wallet = null;
    this._detectProvider = null;
    this._chainId = config.chainId;
    this._config = config;
    if (typeof window !== 'undefined') {
      this.detect();
    }
  }

  get loginState() {
    return this._loginState;
  }

  get wallet() {
    return this._wallet as TWalletInfo;
  }

  get disconnectConfirm() {
    return this._config.disconnectConfirm;
  }

  private async getProvider() {
    if (this._detectProvider) return this._detectProvider;
    return await detectWebProvider();
  }

  private async detect(): Promise<IPortkeyProvider> {
    if (this._detectProvider?.isConnected()) {
      return this._detectProvider;
    }
    this._detectProvider = await this.getProvider();
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

  private async onAccountsSuccess(accounts?: Accounts): Promise<TWalletInfo> {
    let nickName = 'Wallet 01';
    const provider = await this.getProvider();
    const walletInfo: any = await this.updateWalletCache();
    if (!walletInfo || !walletInfo.caAddress) return;
    const address = wallet.removeELFAddressSuffix(walletInfo?.caAddress);
    try {
      nickName = walletInfo?.nickName;
    } catch (error) {
      console.warn(error);
    }
    const cacheAccounts =
      walletInfo?.caAddress && walletInfo.originChainId
        ? [{ chainId: walletInfo.originChainId, address: walletInfo?.caAddress }]
        : undefined;

    const _accounts = accounts ? accounts : cacheAccounts;
    this._wallet = {
      address,
      extraInfo: {
        accounts: _accounts,
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
      const provider = await this.getProvider();
      if (!provider) {
        throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
      }
      const chainId = this._chainId;

      this._loginState = LoginStateEnum.CONNECTING;

      let accounts = await provider.request({ method: 'accounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        return await this.onAccountsSuccess(accounts);
      }
      accounts = await provider.request({ method: 'requestAccounts' });
      console.log(accounts, 'accounts=requestAccounts=login');

      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        return await this.onAccountsSuccess(accounts);
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
      this._loginState = LoginStateEnum.CONNECTING;

      const provider = await this.getProvider();

      const { isUnlocked } = (await provider?.request({ method: 'wallet_getWalletState' })) ?? {};

      console.log('isUnlocked', isUnlocked);
      if (!isUnlocked) {
        console.log('portkey-web-wallet-loginEagerly-locked');
        return;
      }
      const accounts = await provider?.request({ method: 'accounts' });
      await this.onAccountsSuccess(accounts);
    } catch (error) {
      this.emit('error', makeError(ERR_CODE.DISCOVER_LOGIN_EAGERLY_FAIL, error));
    }
  }

  async logout() {
    const provider = await this.getProvider();

    await provider?.request({ method: 'wallet_disconnect' });
    this._wallet = null;
    this._loginState = LoginStateEnum.INITIAL;
    enhancedLocalStorage.removeItem(ConnectedWallet);
    WalletInfoControl.resetWalletInfo();
    this.emit('disconnected');
  }

  async lock() {
    const provider = await this.getProvider();

    await provider?.request({ method: 'wallet_lock' });
    this._wallet = null;
    this._loginState = LoginStateEnum.INITIAL;
    this.emit('disconnected', true);
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
    const provider = await this.getProvider();

    if (!provider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }

    const signInfo = params.signInfo;
    const signedMsgObject = await provider.request({
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
    const provider = await this.getProvider();

    if (!provider) {
      const walletInfo = WalletInfoControl.getWalletInfo();
      if (walletInfo?.caAddress) return wallet.removeAddressSuffix(walletInfo.caAddress);
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    let accounts = this._wallet.extraInfo?.accounts;
    if (!accounts[chainId] || accounts[chainId]?.length === 0) {
      accounts = await provider.request({ method: 'accounts' });
    }
    return accounts[chainId]?.[0];
  }

  async getWalletSyncIsCompleted(chainId: TChainId): Promise<string | boolean> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    const provider = await this.getProvider();
    if (!provider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    const { getOriginalAddress } = utils;
    try {
      const status = await provider.request({
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

  private async updateWalletCache() {
    try {
      const provider = await this.getProvider();
      const walletInfo = await provider?.request({ method: 'walletInfo' });
      console.log(walletInfo, provider, 'walletInfo==updateWalletCache');
      walletInfo && WalletInfoControl.setWalletInfo(walletInfo as any);
      return walletInfo;
    } catch (error) {
      console.error('setWalletCache', error);
      return;
    }
  }

  private async listenProviderEvents() {
    const provider = await this.getProvider();

    if (!provider) {
      return;
    }
    const onDisconnected = (error: ProviderError) => {
      console.log('onDisconnected', error);
      if (!this._wallet) return;
    };

    const onAccountsChanged = (accounts: Accounts) => {
      if (!this._wallet) return;
      const chainId = this._chainId;
      if (
        !accounts[chainId] ||
        accounts[chainId]!.length === 0 ||
        accounts[chainId]!.find((addr) => addr !== this._wallet!.address)
      ) {
        //
      } else {
        this.updateWalletCache();
      }
    };
    const onNetworkChanged = () => {
      //
      console.log('onNetworkChanged');
    };
    const onChainChanged = (chainIds: ChainIds) => {
      if (chainIds.find((id) => id === this._chainId)) {
        //
      }
    };

    const discoverEventsMap = {
      disconnected: onDisconnected,
      networkChanged: onNetworkChanged,
      accountsChanged: onAccountsChanged,
      chainChanged: onChainChanged,
    };
    (Object.keys(discoverEventsMap) as TDiscoverEventsKeys).forEach((ele) => {
      provider.on(ele, discoverEventsMap[ele]);
    });
  }

  async getContract(chainId: TChainId, contractAddress: string): Promise<IContract> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    const provider = await this.getProvider();

    if (!provider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    const chain = await provider.getChain(chainId);
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
    const provider = await this.getProvider();

    if (!provider) {
      throw makeError(ERR_CODE.WITHOUT_DETECT_PROVIDER);
    }
    if (!contractAddress) {
      throw makeError(ERR_CODE.INVALID_CONTRACT_ADDRESS);
    }
    const finalChainId = chainId || this._chainId;
    const contract = await this.getContract(finalChainId, contractAddress);
    const rs = contract.callSendMethod(methodName, '', args, sendOptions);
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
    const provider = await this.getProvider();

    if (!provider) {
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

  async goAssets() {
    const provider = await this.getProvider();

    await provider?.request({ method: 'wallet_showAssets' });
  }
}
