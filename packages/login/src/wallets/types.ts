import { WalletType, WebLoginState } from '../constants';

export type WalletHookParams = {
  loginState: WebLoginState;
  setLoginState: (state: WebLoginState) => void;
  setLoginError: (error: any | unknown) => void;
  setWalletType: (wallet: WalletType) => void;
};

export type WalletHookInterface = {
  wallet: { address: string };
  loginEagerly: () => void;
  login: () => void;
  logout: () => void;
  callContract<T, R>(params: CallContractParams<T>): Promise<R>;
};

export type WalletHook = (params: WalletHookParams) => WalletHookInterface;

export interface CallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
}

export type CallContractFunc<T, R> = (params: CallContractParams<T>) => Promise<R>;

export interface WalletContextType extends WalletHookInterface {
  loginError?: any | unknown;
  loginState: WebLoginState;
}
