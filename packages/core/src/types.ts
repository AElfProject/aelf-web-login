import CancelablePromiseImpl from 'cancelable-promise';

export type LoginState = 'initial' | 'logining' | 'logined' | 'logouting';

export type WalletType = 'Unknown' | 'Discover' | 'NightElf' | 'PortkeySDK';

export type WalletInfo = {
  address: string;
};

export type EventType = 'logined' | 'cancelLogin' | 'commonError';

export interface ILogin<W extends WalletInfo> {
  walletType: WalletType;
  walletInfo: W;
  loginState: LoginState;
  on<T>(event: EventType, listener: (data: T) => void): void;
  off<T>(event: EventType, listener: (data: T) => void): void;
  emit<T>(event: EventType, data: T): void;
  login(): CancelablePromise<void>;
  canLoginEagerly(): boolean;
  loginEagerly(): Promise<void>;
  logout(): Promise<void>;
  getWalletName(): Promise<string | undefined>;
  getSignature(signInfo: string): Promise<string>;
}

export type CancelablePromise<T> = CancelablePromiseImpl<T>;

export type CancelablePromiseExecutor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
  onCancel: (cancelHandler: () => void) => void,
) => void;
