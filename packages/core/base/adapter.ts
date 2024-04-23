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
  logOut(): Promise<void>;
  loginEagerly(): Promise<boolean>;
  getAccounts(chainId: TChainId): Promise<string>;
  callContract<T, R>(params: ICallContractParams<T>): Promise<R>;
  getSignature(params: TSignatureParams): Promise<{
    error: number;
    errorMessage: string;
    signature: string;
    from: string;
  }>;
}
