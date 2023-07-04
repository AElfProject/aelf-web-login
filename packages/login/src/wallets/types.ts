import { EventEmitter } from 'events';
import type { WalletType, WebLoginState } from '../constants';
import { WalletHookInterface } from '../types';

export type WalletHookParams<T> = {
  options: T;
  walletType: WalletType;
  loginState: WebLoginState;
  eventEmitter: EventEmitter;
  setLoginState: (state: WebLoginState) => void;
  setLoginError: (error: any | unknown) => void;
  setWalletType: (wallet: WalletType) => void;
  setLoading: (loading: boolean) => void;
};

export type WalletHook<T> = (params: WalletHookParams<T>) => WalletHookInterface;

export interface WalletContextType extends WalletHookInterface {
  loginError?: any | unknown;
  loginState: WebLoginState;
}
