import { LoginBase } from './LoginBase';
import { LoginState, PortkeySDKWalletInfo, WalletInfo, WalletType } from './types';
import { DiscoverWalletInfo } from './wallets/discover';
import { NightElfWalletInfo } from './wallets/nightElf';

export type WebLoginWalletInfo = WalletInfo & {
  nightElf?: NightElfWalletInfo | undefined;
  portkey?: PortkeySDKWalletInfo | undefined;
  discover?: DiscoverWalletInfo | undefined;
};

export class WebLogin extends LoginBase<WebLoginWalletInfo> {
  walletInfo: WebLoginWalletInfo;
  walletType: WalletType = 'Unknown';
  loginState: LoginState = 'initial';

  constructor() {
    super();
    this.walletInfo = { address: '' };
  }

  login(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  logout(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getWalletName(): Promise<string | undefined> {
    throw new Error('Method not implemented.');
  }
  getSignature(signInfo: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
