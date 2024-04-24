import { WalletAdapter } from '@aelf-web-login/wallet-adapter-base';

class Bridge {
  private _wallets: WalletAdapter[];
  private _activeWallet: WalletAdapter | undefined;

  constructor(wallets: WalletAdapter[]) {
    this._wallets = wallets;
    this._activeWallet = undefined;
  }

  connect = () => {
    console.log('connect');
    this.openSignInModal();
  };

  onConnectedHandler = () => {
    console.log('in connected event');
    localStorage.setItem('connectedWallet', this._activeWallet!.name);
  };

  onConnectErrorHandler = (err: any) => {
    console.log('in error event', err, this._activeWallet);
    localStorage.removeItem('connectedWallet');
    this.closeSignIModal();
  };

  bindEvents = () => {
    console.log('bindEvents', this._activeWallet);
    if (!this._activeWallet) {
      return;
    }
    this._activeWallet.on('connected', this.onConnectedHandler);
    this._activeWallet.on('error', this.onConnectErrorHandler);
  };

  unbindEvents = () => {
    console.log('unbindEvents', this._activeWallet);
    if (!this._activeWallet) {
      return;
    }
    this._activeWallet.off('connected', this.onConnectedHandler);
    this._activeWallet.off('error', this.onConnectErrorHandler);
  };

  openSignInModal() {}

  closeSignIModal() {}

  openLoadingModal() {}

  closeLoadingModal() {}

  onEOAClick = async (name: string) => {
    try {
      this.openLoadingModal();
      this._activeWallet = this._wallets.find((ele) => ele.name === name);
      this.bindEvents();
      await this._activeWallet?.login();
    } catch (e) {
      console.log('onEOAClickError', e);
    } finally {
      console.log('onEOAClickFinally');
      this.closeLoadingModal();
    }
  };
}

export { Bridge };
