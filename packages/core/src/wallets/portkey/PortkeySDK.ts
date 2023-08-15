import { LoginBase } from '../../LoginBase';
import { LoginState, PortkeySDKWalletInfo, WalletType } from '../../types';

/**
 * implement login feature based on portkey sdk
 */
export abstract class PortkeySDK extends LoginBase<PortkeySDKWalletInfo> {
  walletInfo: PortkeySDKWalletInfo;
  walletType: WalletType = 'PortkeySDK';
  loginState: LoginState = 'initial';

  constructor() {
    super();
    this.walletInfo = { address: '' };
  }

  getWalletName(): Promise<string | undefined> {
    throw new Error('Method not implemented.');
  }
  getSignature(signInfo: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  abstract login(): Promise<void>;
  abstract logout(): Promise<void>;
}
