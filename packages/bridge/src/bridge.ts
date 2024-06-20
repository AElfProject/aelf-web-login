/* eslint-disable @typescript-eslint/no-empty-function */
import {
  TWalletInfo,
  WalletAdapter,
  ConnectedWallet,
  TWalletError,
  PORTKEYAA,
  PORTKEY_DISCOVER,
  TChainId,
  ICallContractParams,
  TSignatureParams,
  enhancedLocalStorage,
  IWalletAdapterEvents,
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
} from './store';
import { DIDWalletInfo } from '@portkey/did-ui-react';
import { isPortkeyApp } from '@aelf-web-login/utils';

class Bridge {
  private _wallets: WalletAdapter[];
  private _activeWallet: WalletAdapter | undefined;
  private _loginResolve: (value: TWalletInfo) => void;
  private _loginReject: (error: TWalletError) => void;
  private _eventMap: Record<keyof IWalletAdapterEvents, any> = {} as IWalletAdapterEvents;

  constructor(wallets: WalletAdapter[]) {
    this._wallets = wallets;
    this._activeWallet = undefined;
    this._loginResolve = () => {};
    this._loginReject = () => {};
    this._eventMap = {
      connected: this.onConnectedHandler,
      disconnected: this.onDisConnectedHandler,
      lock: this.onLockHandler,
      error: this.onConnectErrorHandler,
    };
    this.bindEvents();
  }

  get loginState() {
    return this.activeWallet?.loginState;
  }

  get activeWallet() {
    try {
      if (isPortkeyApp()) {
        this._activeWallet = this._wallets.find((item) => item.name === PORTKEY_DISCOVER);
        return this._activeWallet;
      } else {
        return (
          this._activeWallet ||
          this._wallets.find((item) => item.name === enhancedLocalStorage.getItem(ConnectedWallet))
        );
      }
    } catch (e) {
      return undefined;
    }
  }

  get isAAWallet() {
    return this.activeWallet?.name === PORTKEYAA;
  }

  connect = async (): Promise<TWalletInfo> => {
    return new Promise((resolve, reject) => {
      this._loginResolve = resolve;
      this._loginReject = reject;
      console.log('connect');
      this.openLoginPanel();
    });
  };

  disConnect = async (isDoubleCheck = false) => {
    console.log('disconnect', isDoubleCheck, this.isAAWallet);
    try {
      if (isDoubleCheck || (this.isAAWallet && this.activeWallet!.noNeedForConfirm)) {
        // only click confirmLogout button/or noNeedForConfirm can enter here
        await this.activeWallet?.logout();
        this.closeConfirmLogoutPanel();
        this.closeLockPanel();
      } else {
        if (this.isAAWallet) {
          this.openConfirmLogoutPanel();
        } else {
          await this.activeWallet?.logout();
        }
      }
    } catch (e) {
      console.log(e);
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
    console.log('xxxxxxxxxxxxx-------');
    dispatch(setWalletInfo(walletInfo));
    dispatch(setWalletType(this.activeWallet?.name));
    dispatch(clearLoginError());
  };

  onDisConnectedHandler = (isLocking = false) => {
    !isLocking && this.unbindEvents();
    isLocking && this.openLockPanel();
    this.closeNestedModal();
    dispatch(clearWalletInfo());
    dispatch(clearWalletType());
    dispatch(clearLoginError());
  };

  onLockHandler = () => {
    this.openLockPanel();
    dispatch(setLocking(true));
  };

  onConnectErrorHandler = (err: TWalletError) => {
    console.log('in error event', err, this.activeWallet);
    this.unbindEvents();
    this.closeLoginPanel();
    this.closeLoadingModal();
    this._loginReject(err);
    this.closeNestedModal();
    dispatch(clearWalletInfo());
    dispatch(clearWalletType());
    dispatch(setLoginError(err));
  };

  bindEvents = () => {
    console.log('bindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    Object.entries(this._eventMap).forEach(([k, v]) => {
      this.activeWallet!.on(k as keyof IWalletAdapterEvents, v);
    });
  };

  unbindEvents = () => {
    console.log('unbindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    Object.entries(this._eventMap).forEach(([k, v]) => {
      this.activeWallet!.off(k as keyof IWalletAdapterEvents, v);
    });
  };

  openLoginPanel() {}

  closeLoginPanel() {}

  openLoadingModal() {}

  closeLoadingModal() {}

  openLockPanel() {}

  closeLockPanel() {}

  openConfirmLogoutPanel() {}

  closeConfirmLogoutPanel() {}

  closeNestedModal() {}

  onUniqueWalletClick = async (name: string) => {
    try {
      this.openLoadingModal();
      this._activeWallet = this._wallets.find((ele) => ele.name === name);
      this.bindEvents();
      const walletInfo = await this._activeWallet?.login();
      this._loginResolve(walletInfo);
    } catch (e) {
      console.log('onUniqueWalletClick', e);
    } finally {
      this.closeLoadingModal();
      this.closeLoginPanel();
    }
  };

  onPortkeyAAWalletLoginFinished = async (didWalletInfo: DIDWalletInfo) => {
    try {
      this.openLoadingModal();
      this._activeWallet = this._wallets.find((item) => item.name === PORTKEYAA);
      this.bindEvents();
      const walletInfo = await this.activeWallet?.login(didWalletInfo);
      this._loginResolve(walletInfo);
    } catch (error) {
      console.log('onPortkeyAAWalletLoginFinishedError', error);
    } finally {
      this.closeLoadingModal();
      this.closeLoginPanel();
    }
  };

  onPortkeyAAUnLock = async (pin: string): Promise<TWalletInfo> => {
    try {
      this.openLoadingModal();
      if (!this.activeWallet?.onUnlock || typeof this.activeWallet.onUnlock !== 'function') {
        return;
      }
      const walletInfo = await this.activeWallet?.onUnlock(pin);
      console.log('onPortkeyAAUnLockSuccess----------', walletInfo);
      if (walletInfo) {
        this.closeLoginPanel();
        dispatch(setLocking(false));
        dispatch(clearLoginError());
      }
      return walletInfo;
    } catch (error) {
      console.log('onPortkeyAAUnLockFail----------');
      return;
    } finally {
      this.closeLoadingModal();
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
}

export { Bridge };
