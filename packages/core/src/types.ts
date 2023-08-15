import type { DIDWalletInfo } from '@portkey/did-ui-react';

export type LoginState = 'initial' | 'logining' | 'logined' | 'logouting';

export type WalletType = 'Unknown' | 'Discover' | 'NightElf' | 'PortkeySDK';

export type WalletInfo = {
  address: string;
};

export type EventType = 'logined';

export type PortkeySDKWalletInfo = WalletInfo & {
  didWalletInfo?: DIDWalletInfo | undefined;
};

export interface ILogin<T extends WalletInfo> {
  walletType: WalletType;
  walletInfo: T;
  loginState: LoginState;
  on(event: EventType, listener: () => void): void;
  off(event: EventType, listener: () => void): void;
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
