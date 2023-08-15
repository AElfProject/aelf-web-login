import { ILogin, LoginState, WalletInfo, WalletType } from '../../types';

export type DiscoverWalletInfo = WalletInfo & {};

/**
 * implement login feature based on aelf-bridge
 */
export class Discover implements ILogin<DiscoverWalletInfo> {
  walletInfo: DiscoverWalletInfo;
  walletType: WalletType = 'Discover';
  loginState: LoginState = 'initial';

  constructor() {
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
