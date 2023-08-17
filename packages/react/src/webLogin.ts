import {
  NightElf,
  Discover,
  WebLogin,
  CancelablePromise,
  newCancelablePromise,
  makeError,
  ERR_CODE,
} from '@aelf-web-login/core';
import { PortkeyUISDK } from './portkey/PortkeyUISDK';

export class ReactWebLogin extends WebLogin {
  private _portkeySDK: PortkeyUISDK;
  private _nightElf: NightElf;
  private _discover: Discover;

  constructor({
    portkeySDK,
    nightElf,
    discover,
  }: {
    portkeySDK: PortkeyUISDK;
    nightElf: NightElf;
    discover: Discover;
  }) {
    super();
    this._portkeySDK = portkeySDK;
    this._nightElf = nightElf;
    this._discover = discover;
  }

  canLoginEagerly(): boolean {
    return this._portkeySDK.canLoginEagerly() || this._discover.canLoginEagerly() || this._nightElf.canLoginEagerly();
  }

  setLoginEagerly(flag: boolean): void {
    this._portkeySDK.setLoginEagerly(flag);
    this._nightElf.setLoginEagerly(flag);
    this._discover.setLoginEagerly(flag);
  }

  loginEagerly(): Promise<void> {
    if (this._discover.canLoginEagerly()) {
      return this._discover.loginEagerly();
    }
    if (this._nightElf.canLoginEagerly()) {
      return this._nightElf.loginEagerly();
    }
    if (this._portkeySDK.canLoginEagerly()) {
      this._portkeySDK.loginEagerly();
    }
    return Promise.resolve();
  }

  login(): CancelablePromise<void> {
    if (this.loginState !== 'initial') {
      throw new Error(`call login when loginState is not initial ${this.loginState}`);
    }
    if (!this._portkeySDK.signInfRef.current) {
      throw new Error('call login on invalid state, portkeySDK.signInfRef.current is null');
    }
    this.loginState = 'logining';
    return newCancelablePromise((resolve, reject, onCancel) => {
      const loginPromise: CancelablePromise<void> = this._portkeySDK.login();

      const onLogined = () => {
        const isPortkeySDKLogined = this._portkeySDK.loginState === 'logined';
        if (!isPortkeySDKLogined) {
          loginPromise.cancel();
        }

        this._portkeySDK.off('logined', onLogined);
        this._discover.off('logined', onLogined);
        this._nightElf.off('logined', onLogined);

        if (this._discover.loginState === 'logined') {
          this._current = this._discover;
        } else if (this._portkeySDK.loginState === 'logined') {
          this._current = this._portkeySDK;
        } else if (this._nightElf.loginState === 'logined') {
          this._current = this._nightElf;
        } else {
          this.reset();
          reject(makeError(ERR_CODE.USER_CANCEL));
          return;
        }
        this.loginState = 'logined';
        this.walletInfo = this._current.walletInfo;
        this.walletType = this._current.walletType;

        resolve();
      };

      this._portkeySDK.on('logined', onLogined);
      this._discover.on('logined', onLogined);
      this._nightElf.on('logined', onLogined);

      // TODO cancel event

      onCancel(() => {
        this.loginState = 'initial';
        this._portkeySDK.off('logined', onLogined);
        this._discover.off('logined', onLogined);
        this._nightElf.off('logined', onLogined);
      });
    });
  }

  logout(): Promise<void> {
    if (this._current) {
      return this._current.logout();
    }
    return Promise.reject(new Error('No wallet logined'));
  }

  private reset(): void {
    this.loginState = 'initial';
    this.walletInfo = { address: '' };
    this.walletType = 'Unknown';
    this._current = undefined;
  }
}
