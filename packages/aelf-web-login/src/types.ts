export type WalletType = 'Discover' | 'NightElf' | 'PortkeySDK';

export type WalletInfo = {
  address: string;
};

export type PortkeySDKWalletInfo = WalletInfo & {};

export interface ILogin<T extends WalletInfo> {
  walletType: WalletType;
  walletInfo: T;
  login(): Promise<void>;
  logout(): Promise<void>;
  getWalletName(): Promise<string | undefined>;
  getSignature(signInfo: string): Promise<string>;
}

export type PortkeySDKLoginType =
  | 'Google'
  | 'Apple'
  | 'Email'
  | 'Phone'
  | 'Scan'
  | 'PortkeyApp'
  | 'Default'
  | 'AllInOne';
