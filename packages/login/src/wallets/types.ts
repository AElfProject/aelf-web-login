import type { AElfContextType } from '@aelf-react/core/dist/types';
import type { DIDWalletInfo } from '@portkey/did-ui-react';
import type { WalletType, WebLoginState } from '../constants';

export type WalletHookParams = {
  loginState: WebLoginState;
  setLoginState: (state: WebLoginState) => void;
  setLoginError: (error: any | unknown) => void;
  setWalletType: (wallet: WalletType) => void;
};

export type SignatureParams = {
  appName: string;
  address: string;
  hexToBeSign: string;
};
export type SignatureData = {
  signature: string;
  error: number;
  errorMessage: string;
  from: string;
};

export type PortkeyInfo = DIDWalletInfo & {
  nickName: string;
};

export type WalletHookInterface = {
  wallet: {
    name?: string;
    address: string;
    publicKey?: string;
    nightElfInfo?: AElfContextType;
    portkeyInfo?: PortkeyInfo;
  };
  loginEagerly: () => void;
  login: () => void;
  logout: () => void;
  callContract<T, R>(params: CallContractParams<T>): Promise<R>;
  getSignature(params: SignatureParams): Promise<SignatureData>;
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
