import { CancelablePromise, EventType, ILogin, LoginState, WalletInfo, WalletType } from './types';
import { EventEmitter } from 'events';

export abstract class LoginBase<W extends WalletInfo> implements ILogin<W> {
  abstract walletInfo: W;
  abstract walletType: WalletType;
  abstract loginState: LoginState;

  protected _events: EventEmitter;

  constructor() {
    this._events = new EventEmitter();
  }

  getLoginEagerlyKey(): string {
    return `AElf.WebLogin.${this.walletType}.loginEagerly`;
  }

  on<T>(event: EventType, listener: (data: T) => void): void {
    this._events.on(event, listener);
  }
  off<T>(event: EventType, listener: (data: T) => void): void {
    this._events.off(event, listener);
  }

  emit<T>(event: EventType, data: T) {
    this._events.emit(event, data);
  }

  canLoginEagerly(): boolean {
    return !!localStorage.getItem(this.getLoginEagerlyKey());
  }

  setLoginEagerly(flag: boolean) {
    const key = this.getLoginEagerlyKey();
    if (flag) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.removeItem(key);
    }
  }

  abstract loginEagerly(): Promise<void>;
  abstract login(): CancelablePromise<void>;
  abstract logout(): Promise<void>;
  abstract getWalletName(): Promise<string | undefined>;
  abstract getSignature(signInfo: string): Promise<string>;
}
