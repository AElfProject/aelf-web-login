import { ILogin, LoginState, WalletInfo, WalletType } from '../../types';

export type NightElfWalletInfo = WalletInfo & {};

/**
 * implement login feature based on aelf-bridge
 */
export class NightElf implements ILogin<NightElfWalletInfo> {
  walletInfo: NightElfWalletInfo;
  walletType: WalletType = 'NightElf';
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
