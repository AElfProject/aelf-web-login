import EventEmitter from 'eventemitter3';

import { WalletError } from './errors';
import {
  ICallContractParams,
  LoginStateEnum,
  TChainId,
  TSignatureParams,
  TWalletInfo,
  WalletStateEnum,
} from './types';

export { EventEmitter };

export interface IWalletAdapterEvents {
  loggedIn(): void;
  logout(): void;
  lock(): void;
  readyStateChange(readyState: WalletStateEnum): void;
  error(error: WalletError): void;
}

export type WalletName<T extends string = string> = T & { __brand__: 'WalletName' };

export interface IWalletAdapter<Name extends string = string> {
  name: WalletName<Name>;
  icon: string;
  readyState: WalletStateEnum;
  loginState: LoginStateEnum;
  wallet: TWalletInfo;

  login(): Promise<TWalletInfo>;
  // logOut(): Promise<void>;
  // loginEagerly(): Promise<boolean>;
  // getAccounts(chainId: TChainId): Promise<string>;
  // callContract<T, R>(params: ICallContractParams<T>): Promise<R>;
  // getSignature(params: TSignatureParams): Promise<{
  //   error: number;
  //   errorMessage: string;
  //   signature: string;
  //   from: string;
  // }>;
}

export type WalletAdapter<Name extends string = string> = IWalletAdapter<Name> &
  EventEmitter<IWalletAdapterEvents>;

export abstract class BaseWalletAdapter<Name extends string = string>
  extends EventEmitter<IWalletAdapterEvents>
  implements IWalletAdapter<Name>
{
  abstract name: WalletName<Name>;
  abstract icon: string;
  abstract readyState: WalletStateEnum;
  abstract loginState: LoginStateEnum;
  abstract wallet: TWalletInfo;

  abstract login(): Promise<TWalletInfo>;
  // abstract logOut(): Promise<void>;
  // abstract loginEagerly(): Promise<boolean>;
  // abstract getAccounts(chainId: TChainId): Promise<string>;
  // abstract callContract<T, R>(params: ICallContractParams<T>): Promise<R>;
  // abstract getSignature(params: TSignatureParams): Promise<{
  //   error: number;
  //   errorMessage: string;
  //   signature: string;
  //   from: string;
  // }>;
}

export function scopePollingDetectionStrategy(detect: () => boolean): void {
  // Early return when server-side rendering
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const disposers: (() => void)[] = [];

  function detectAndDispose() {
    const detected = detect();
    if (detected) {
      for (const dispose of disposers) {
        dispose();
      }
    }
  }

  // Strategy #1: Try detecting every second.
  const interval =
    // TODO: #334 Replace with idle callback strategy.
    setInterval(detectAndDispose, 1000);
  disposers.push(() => clearInterval(interval));

  // Strategy #2: Detect as soon as the DOM becomes 'ready'/'interactive'.
  if (
    // Implies that `DOMContentLoaded` has not yet fired.
    document.readyState === 'loading'
  ) {
    document.addEventListener('DOMContentLoaded', detectAndDispose, { once: true });
    disposers.push(() => document.removeEventListener('DOMContentLoaded', detectAndDispose));
  }

  // Strategy #3: Detect after the `window` has fully loaded.
  if (
    // If the `complete` state has been reached, we're too late.
    document.readyState !== 'complete'
  ) {
    window.addEventListener('load', detectAndDispose, { once: true });
    disposers.push(() => window.removeEventListener('load', detectAndDispose));
  }

  // Strategy #4: Detect synchronously, now.
  detectAndDispose();
}
