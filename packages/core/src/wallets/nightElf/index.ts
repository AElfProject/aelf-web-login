import { LoginBase } from '../../LoginBase';
import { LoginState, WalletInfo, WalletType } from '../../types';

export type NightElfWalletInfo = WalletInfo & {};

/**
 * implement login feature based on aelf-bridge
 */
export class NightElf extends LoginBase<NightElfWalletInfo> {
  walletInfo: NightElfWalletInfo;
  walletType: WalletType = 'NightElf';
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
