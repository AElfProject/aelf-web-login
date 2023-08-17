import { LoginBase } from './LoginBase';
import { CancelablePromise, ILogin, LoginState, WalletInfo, WalletType } from './types';
import { DiscoverWalletInfo } from './wallets/discover';
import { NightElfWalletInfo } from './wallets/nightElf';
import { PortkeySDKWalletInfo } from './wallets/portkey';

export type WebLoginWalletInfo = WalletInfo & {
  nightElf?: NightElfWalletInfo | undefined;
  portkey?: PortkeySDKWalletInfo | undefined;
  discover?: DiscoverWalletInfo | undefined;
};

export abstract class WebLogin extends LoginBase<WebLoginWalletInfo> {
  walletInfo: WebLoginWalletInfo;
  walletType: WalletType = 'Unknown';
  loginState: LoginState = 'initial';

  protected _current: ILogin<NightElfWalletInfo | PortkeySDKWalletInfo | DiscoverWalletInfo> | undefined;

  constructor() {
    super();
    this.walletInfo = { address: '' };
  }

  abstract setLoginEagerly(flag: boolean): void;
  abstract canLoginEagerly(): boolean;
  abstract loginEagerly(): Promise<void>;
  abstract login(): CancelablePromise<void>;
  abstract logout(): Promise<void>;

  getWalletName(): Promise<string | undefined> {
    if (!this._current) {
      throw new Error('No wallet logined');
    }
    return this._current.getWalletName();
  }

  getSignature(signInfo: string): Promise<string> {
    if (!this._current) {
      throw new Error('No wallet logined');
    }
    return this._current.getSignature(signInfo);
  }
}
