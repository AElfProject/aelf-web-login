import { TWalletInfo, WalletAdapter, ConnectedWallet } from '@aelf-web-login/wallet-adapter-base';
import { setWalletInfo, clearWalletInfo, dispatch } from './store';

class Bridge {
  private _wallets: WalletAdapter[];
  private _activeWallet: WalletAdapter | undefined;
  private _loginResolve: (value: TWalletInfo) => void;
  private _loginReject: (reason?: any) => void;

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

  connect = async () => {
    return new Promise((resolve, reject) => {
      this._loginResolve = resolve;
      this._loginReject = reject;
      console.log('connect');
      this.openSignInModal();
    });
  };

  disConnect = () => {
    console.log('disconnect');
    try {
      this.activeWallet?.logout();
    } catch (e) {
      console.log(e);
    }
  };

  onConnectedHandler = (walletInfo: TWalletInfo) => {
    localStorage.setItem(ConnectedWallet, this.activeWallet!.name);
    dispatch(setWalletInfo(walletInfo));
  };

  onDisConnectedHandler = () => {
    localStorage.removeItem(ConnectedWallet);
    dispatch(clearWalletInfo());
  };

  onConnectErrorHandler = (err: any) => {
    console.log('in error event', err, this.activeWallet);
    localStorage.removeItem(ConnectedWallet);
    this.closeSignIModal();
  };

  bindEvents = () => {
    console.log('bindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    // TODO: put them into a list for loop
    this.activeWallet.on('connected', this.onConnectedHandler);
    this.activeWallet.on('disconnected', this.onDisConnectedHandler);
    this.activeWallet.on('error', this.onConnectErrorHandler);
  };

  unbindEvents = () => {
    console.log('unbindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    this.activeWallet.off('connected', this.onConnectedHandler);
    this.activeWallet.off('disconnected', this.onDisConnectedHandler);
    this.activeWallet.off('error', this.onConnectErrorHandler);
  };

  openSignInModal() {}

  closeSignIModal() {}

  openLoadingModal() {}

  closeLoadingModal() {}

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
      console.log('onUniqueWalletClick');
      this.closeLoadingModal();
      this.closeSignIModal();
    }
  };
}

export { Bridge };
