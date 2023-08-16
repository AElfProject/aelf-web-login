import { LoginBase } from '../../LoginBase';
import { LoginState, WalletInfo, WalletType } from '../../types';

export type DiscoverWalletInfo = WalletInfo & {};

/**
 * implement login feature based on detect provider
 */
export class Discover extends LoginBase<DiscoverWalletInfo> {
  walletInfo: DiscoverWalletInfo;
  walletType: WalletType = 'Discover';
  loginState: LoginState = 'initial';

  constructor() {
    super();
    this.walletInfo = { address: '' };
  }

  loginEagerly(): Promise<void> {
    throw new Error('Method not implemented.');
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
