import {
  TWalletInfo,
  WalletAdapter,
  ConnectedWallet,
  TWalletError,
  PORTKEYAA,
  TChainId,
  ICallContractParams,
} from '@aelf-web-login/wallet-adapter-base';
import { setWalletInfo, clearWalletInfo, dispatch } from './store';
import { DIDWalletInfo } from '@portkey/did-ui-react';

class Bridge {
  private _wallets: WalletAdapter[];
  private _activeWallet: WalletAdapter | undefined;
  private _loginResolve: (value: TWalletInfo) => void;
  private _loginReject: (error: TWalletError) => void;

  constructor(wallets: WalletAdapter[]) {
    this._wallets = wallets;
    this._activeWallet = undefined;
    this._loginResolve = () => {};
    this._loginReject = () => {};
    this.bindEvents();
  }

  get loginState() {
    return this.activeWallet?.loginState;
  }

  get activeWallet() {
    try {
      return (
        this._activeWallet ||
        this._wallets.find((item) => item.name === localStorage.getItem(ConnectedWallet))
      );
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
      this.openSignInModal();
    });
  };

  disConnect = async (isDoubleCheck: boolean = false) => {
    console.log('disconnect');
    try {
      if (isDoubleCheck) {
        // only click confirmLogout button can enter here
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

  onConnectedHandler = (walletInfo: TWalletInfo) => {
    dispatch(setWalletInfo(walletInfo));
  };

  onDisConnectedHandler = () => {
    dispatch(clearWalletInfo());
  };

  onLockHandler = () => {
    this.openLockPanel();
  };

  onConnectErrorHandler = (err: TWalletError) => {
    console.log('in error event', err, this.activeWallet);
    this._loginReject(err);
    alert(err.message);
    this.closeSignIModal();
    this.closeLoadingModal();
    dispatch(clearWalletInfo());
  };

  bindEvents = () => {
    console.log('bindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    // TODO: put them into a list for loop
    this.activeWallet.on('connected', this.onConnectedHandler);
    this.activeWallet.on('disconnected', this.onDisConnectedHandler);
    this.activeWallet.on('lock', this.onLockHandler);
    this.activeWallet.on('error', this.onConnectErrorHandler);
  };

  unbindEvents = () => {
    console.log('unbindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    this.activeWallet.off('connected', this.onConnectedHandler);
    this.activeWallet.off('disconnected', this.onDisConnectedHandler);
    this.activeWallet.off('lock', this.onLockHandler);
    this.activeWallet.off('error', this.onConnectErrorHandler);
  };

  openSignInModal() {}

  closeSignIModal() {}

  openLoadingModal() {}

  closeLoadingModal() {}

  openLockPanel() {}

  closeLockPanel() {}

  openConfirmLogoutPanel() {}

  closeConfirmLogoutPanel() {}

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
      this.closeSignIModal();
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
      this.closeSignIModal();
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
        this.closeSignIModal();
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
  };
}

export { Bridge };
