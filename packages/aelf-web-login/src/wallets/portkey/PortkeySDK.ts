import { ILogin, WalletInfo, WalletType } from '../../types';

export type PortkeySDKWalletInfo = WalletInfo & {};

/**
 * implement login feature based on aelf-bridge
 */
export abstract class PortkeySDK implements ILogin<PortkeySDKWalletInfo> {
  walletInfo: PortkeySDKWalletInfo;
  walletType: WalletType = 'PortkeySDK';

  constructor() {
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
