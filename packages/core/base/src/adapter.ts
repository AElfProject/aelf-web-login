import EventEmitter from 'eventemitter3';
import { DIDWalletInfo } from '@portkey/did-ui-react';
import {
  TWalletError,
  LoginStateEnum,
  TSignatureParams,
  TWalletInfo,
  TChainId,
  WalletStateEnum,
  ICallContractParams,
} from './types';

export { EventEmitter };

export type WalletName<T extends string = string> = T & { __brand__: 'WalletName' };

export interface IWalletAdapterEvents {
  connected(walletInfo: TWalletInfo): void;
  disconnected(isLocking?: boolean): void;
  lock(): void;
  // readyStateChange(readyState: WalletStateEnum): void;
  error(error: TWalletError): void;
}
export interface IWalletAdapter<Name extends string = string> {
  name: WalletName<Name>;
  icon: string;
  // readyState: WalletStateEnum;
  loginState: LoginStateEnum;
  wallet: TWalletInfo;
  noNeedForConfirm?: boolean;

  login(arg?: DIDWalletInfo): Promise<TWalletInfo>;
  logout(): Promise<void>;
  loginEagerly(type?: string): Promise<void>;
  // getAccounts(chainId: TChainId): Promise<string>;
  // callContract<T, R>(params: ICallContractParams<T>): Promise<R>;
  getSignature(params: TSignatureParams): Promise<{
    error: number;
    errorMessage: string;
    signature: string;
    from: string;
  }>;
  getAccountByChainId(chainId: TChainId): Promise<string>;
  getWalletSyncIsCompleted(chainId: TChainId): Promise<string | boolean>;
  callSendMethod<T, R>(props: ICallContractParams<T>): Promise<R>;
  callViewMethod<T, R>(props: ICallContractParams<T>): Promise<R>;
  onUnlock?: (pin: string) => Promise<TWalletInfo>;
  lock?: () => void;
}

export type WalletAdapter<Name extends string = string> = IWalletAdapter<Name> &
  EventEmitter<IWalletAdapterEvents>;

export abstract class BaseWalletAdapter<Name extends string = string>
  extends EventEmitter<IWalletAdapterEvents>
  implements IWalletAdapter<Name>
{
  abstract name: WalletName<Name>;
  abstract icon: string;
  // abstract readyState: WalletStateEnum;
  abstract loginState: LoginStateEnum;
  abstract wallet: TWalletInfo;

  abstract login(arg?: DIDWalletInfo): Promise<TWalletInfo>;
  abstract logout(): Promise<void>;
  abstract loginEagerly(type?: string): Promise<void>;
  // abstract getAccounts(chainId: TChainId): Promise<string>;
  // abstract callContract<T, R>(params: ICallContractParams<T>): Promise<R>;
  abstract getSignature(params: TSignatureParams): Promise<{
    error: number;
    errorMessage: string;
    signature: string;
    from: string;
  }>;
  abstract getAccountByChainId(chainId: TChainId): Promise<string>;
  abstract getWalletSyncIsCompleted(chainId: TChainId): Promise<string | boolean>;
  abstract callSendMethod<T, R>(props: ICallContractParams<T>): Promise<R>;
  abstract callViewMethod<T, R>(props: ICallContractParams<T>): Promise<R>;
}
