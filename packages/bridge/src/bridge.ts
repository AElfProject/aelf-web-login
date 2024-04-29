import { TWalletInfo, WalletAdapter, ConnectedWallet } from '@aelf-web-login/wallet-adapter-base';

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

  onConnectedHandler = () => {
    console.log('in connected event');
    localStorage.setItem(ConnectedWallet, this.activeWallet!.name);
  };

  // TODO: how to clear walletInfo after logout
  onDisConnectedHandler = () => {
    localStorage.removeItem(ConnectedWallet);
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

  onEOAClick = async (name: string) => {
    try {
      this.openLoadingModal();
      this._activeWallet = this._wallets.find((ele) => ele.name === name);
      console.log(this._activeWallet);
      this.bindEvents();
      const walletInfo = await this._activeWallet?.login();
      this._loginResolve(walletInfo);
    } catch (e) {
      console.log('onEOAClickError', e);
    } finally {
      console.log('onEOAClickFinally');
      this.closeLoadingModal();
      this.closeSignIModal();
    }
  };
}

export { Bridge };
