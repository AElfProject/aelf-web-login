import { EventType, ILogin, LoginState, WalletInfo, WalletType } from './types';
import { EventEmitter } from 'events';

export abstract class LoginBase<T extends WalletInfo> implements ILogin<T> {
  abstract walletInfo: T;
  abstract walletType: WalletType;
  abstract loginState: LoginState;

  protected _events: EventEmitter;

  constructor() {
    this._events = new EventEmitter();
  }

  on(event: EventType, listener: () => void): void {
    this._events.on(event, listener);
  }
  off(event: EventType, listener: () => void): void {
    this._events.off(event, listener);
  }

  abstract login(): Promise<void>;
  abstract logout(): Promise<void>;
  abstract getWalletName(): Promise<string | undefined>;
  abstract getSignature(signInfo: string): Promise<string>;
}
