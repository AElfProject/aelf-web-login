/* eslint-disable @typescript-eslint/no-empty-function */
import {
  type TWalletInfo,
  type WalletAdapter,
  type TWalletError,
  PORTKEY_WEB_WALLET,
  PORTKEY_DISCOVER,
  type TChainId,
  type ICallContractParams,
  type TSignatureParams,
  type IWalletAdapterEvents,
  utils,
  type IMultiTransactionParams,
  type IMultiTransactionResult,
  LoginStatusEnum,
  ConnectedWallet,
  enhancedLocalStorage,
  FAIRY_VAULT_DISCOVER,
} from '@aelf-web-login/wallet-adapter-base';
import {
  setWalletInfo,
  clearWalletInfo,
  setLocking,
  setWalletType,
  clearWalletType,
  dispatch,
  setLoginError,
  clearLoginError,
  setLoginOnChainStatus,
} from './store';

import type { IBaseConfig } from '.';
import { EE, SET_GUARDIAN_APPROVAL_PAYLOAD } from './utils';
import { TelegramPlatform } from '@portkey/utils';
import { ThemeType } from '@portkey/connect-web-wallet';

const { isPortkeyApp, isFairyVaultApp } = utils;

class Bridge {
  public _wallets: WalletAdapter[];
  public theme: ThemeType;

  public _activeWallet: WalletAdapter | undefined;
  private _loginResolve: (value: TWalletInfo) => void;
  private _loginReject: (error: TWalletError) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private _eventMap: Record<keyof IWalletAdapterEvents, any> = {} as IWalletAdapterEvents;
  private _sideChainId: TChainId;

  constructor(wallets: WalletAdapter[], { sideChainId = 'tDVV', theme }: IBaseConfig) {
    this._sideChainId = sideChainId;
    this._wallets = wallets;
    this._activeWallet = undefined;
    this.theme = theme || 'dark';
    this._loginResolve = () => {};
    this._loginReject = () => {};
    this._eventMap = {
      connected: this.onConnectedHandler,
      disconnected: this.onDisConnectedHandler,
      lock: this.onLockHandler,
      error: this.onConnectErrorHandler,
      loginOnChainStatusChanged: this.onLoginOnChainStatusChangedHandler,
    };
    this.bindEvents();
  }

  getActiveWallet(walletName?: string) {
    console.log(this._wallets, walletName, 'getActiveWallet, this._wallets ===');
    console.log(window.navigator.userAgent);
    try {
      if (TelegramPlatform.isTelegramPlatform()) {
        console.log('isTelegramPlatform');
        this._activeWallet = this._wallets.find((item) => item.name === PORTKEY_WEB_WALLET);
        return this._activeWallet;
      }
      if (isPortkeyApp()) {
        console.log('isPortkeyApp');
        this._activeWallet = this._wallets.find((item) => item.name === PORTKEY_DISCOVER);
        return this._activeWallet;
      }
      if (isFairyVaultApp()) {
        console.log('isFairyVaultApp');
        this._activeWallet = this._wallets.find((item) => item.name === FAIRY_VAULT_DISCOVER);
        return this._activeWallet;
      }
      const _walletName = walletName ?? enhancedLocalStorage.getItem(ConnectedWallet);
      this._activeWallet = this._wallets.find((item) => item.name === _walletName);
      return this._activeWallet;
    } catch (e) {
      return (this._activeWallet = this._wallets.find((item) => item.name === PORTKEY_WEB_WALLET));
    }
  }

  get activeWallet() {
    if (this._activeWallet) return this._activeWallet;
    return this.getActiveWallet();
  }

  get isAAWallet() {
    return this.activeWallet?.name === PORTKEY_WEB_WALLET;
  }

  connect = async (walletName?: string): Promise<TWalletInfo> => {
    return new Promise((resolve, reject) => {
      this._loginResolve = resolve;
      this._loginReject = reject;

      this.getActiveWallet(walletName);
      return this.onUniqueWalletClick();
    });
  };

  disConnect = async () => {
    try {
      await this.getActiveWallet()?.logout();
      return true;
    } catch (e) {
      console.info(e);
      return false;
    }
  };

  getAccountByChainId = async (chainId: TChainId): Promise<string> => {
    if (
      !this.activeWallet?.getAccountByChainId ||
      typeof this.activeWallet.getAccountByChainId !== 'function'
    ) {
      return '';
    }
    const account = await this.activeWallet?.getAccountByChainId(chainId);
    return account;
  };

  getWalletSyncIsCompleted = async (chainId: TChainId): Promise<string | boolean> => {
    if (
      !this.activeWallet?.getWalletSyncIsCompleted ||
      typeof this.activeWallet.getWalletSyncIsCompleted !== 'function'
    ) {
      return false;
    }
    const account = await this.activeWallet?.getWalletSyncIsCompleted(chainId);
    return account;
  };

  callSendMethod = async <T, R>(props: ICallContractParams<T>): Promise<R> => {
    if (
      !this.activeWallet?.callSendMethod ||
      typeof this.activeWallet.callSendMethod !== 'function'
    ) {
      return null as R;
    }

    const rs = await this.activeWallet?.callSendMethod(props);
    return rs as R;
  };

  getApprovalModalGuardians = async (): Promise<{
    guardians: any[];
  }> => {
    return new Promise((resolve) => {
      EE.once(SET_GUARDIAN_APPROVAL_PAYLOAD, (result) => {
        resolve(result);
      });
    });
  };

  sendMultiTransaction = async <T>(
    params: IMultiTransactionParams<T>,
  ): Promise<IMultiTransactionResult> => {
    if (
      !this.activeWallet?.sendMultiTransaction ||
      typeof this.activeWallet.sendMultiTransaction !== 'function'
    ) {
      return null as unknown as IMultiTransactionResult;
    }
    const rs = await this.activeWallet?.sendMultiTransaction(params);
    return rs;
  };

  callViewMethod = async <T, R>(props: ICallContractParams<T>): Promise<R> => {
    if (
      !this.activeWallet?.callViewMethod ||
      typeof this.activeWallet.callViewMethod !== 'function'
    ) {
      return null as R;
    }
    const rs = await this.activeWallet?.callViewMethod(props);
    return rs as R;
  };

  getSignature = async (
    params: TSignatureParams,
  ): Promise<{
    error: number;
    errorMessage: string;
    signature: string;
    from: string;
  } | null> => {
    if (!this.activeWallet?.getSignature || typeof this.activeWallet.getSignature !== 'function') {
      return null;
    }
    try {
      const rs = await this.activeWallet?.getSignature(params);
      return rs;
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  onConnectedHandler = (walletInfo: TWalletInfo) => {
    dispatch(setWalletInfo(walletInfo));
    dispatch(setWalletType(this.activeWallet?.name));
    dispatch(clearLoginError());
  };

  onDisConnectedHandler = (isLocking = false) => {
    !isLocking && this.unbindEvents();
    dispatch(clearWalletInfo());
    dispatch(clearWalletType());
    dispatch(clearLoginError());
    dispatch(setLocking(false));
    dispatch(setLoginOnChainStatus(LoginStatusEnum.INIT));
  };

  onLockHandler = () => {
    if (TelegramPlatform.isTelegramPlatform()) {
      return;
    }
    dispatch(setLocking(true));
  };

  onConnectErrorHandler = (err: TWalletError) => {
    console.info('in error event', err, this.activeWallet);

    this.unbindEvents();
    this._loginReject(err);
    dispatch(clearWalletInfo());
    dispatch(clearWalletType());
    dispatch(setLoginError(err));
  };

  onLoginOnChainStatusChangedHandler = (status: LoginStatusEnum) => {
    dispatch(setLoginOnChainStatus(status));
  };

  bindEvents = () => {
    console.info('bindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    Object.entries(this._eventMap).forEach(([k, v]) => {
      this.activeWallet!.on(k as keyof IWalletAdapterEvents, v);
    });
  };

  unbindEvents = () => {
    console.info('unbindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    Object.entries(this._eventMap).forEach(([k, v]) => {
      this.activeWallet!.off(k as keyof IWalletAdapterEvents, v);
    });
  };

  onUniqueWalletClick = async () => {
    try {
      this.bindEvents();
      const walletInfo = await this.activeWallet?.login();
      this._loginResolve(walletInfo);
    } catch (e) {
      console.info('onUniqueWalletClick--', e);
    } finally {
      //
    }
  };

  lock = () => {
    if (!this.activeWallet?.lock || typeof this.activeWallet.lock !== 'function') {
      return;
    }
    if (!this.isAAWallet) {
      return;
    }
    this.activeWallet?.lock();
    dispatch(setLocking(true));
  };
  goAssets = () => {
    if (
      !this.activeWallet?.goAssets ||
      typeof this.activeWallet.lock !== 'function' ||
      !this.isAAWallet
    ) {
      return;
    }
    this.activeWallet?.goAssets();
  };
}

export { Bridge };
