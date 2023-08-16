import { NightElf, Discover, WebLogin } from '@aelf-web-login/core';
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

  login(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  logout(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
