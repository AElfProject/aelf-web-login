import type { AElfContextType } from '@aelf-react/core/dist/types';
import type { DIDWalletInfo } from '@portkey/did-ui-react';
import type { WalletType, WebLoginState } from '../constants';
import type { IHolderInfo } from '@portkey/services';

export type WalletHookParams = {
  loginState: WebLoginState;
  setLoginState: (state: WebLoginState) => void;
  setLoginError: (error: any | unknown) => void;
  setWalletType: (wallet: WalletType) => void;
  setLoading: (loading: boolean) => void;
};

export type SignatureParams = {
  appName: string;
  address: string;
  signInfo: string;
  hexToBeSign?: string;
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

export type DiscoverInfo = {
  address: string;
  nickName?: string;
};

export type WalletInfo = {
  name?: string;
  address: string;
  publicKey?: string;
  nightElfInfo?: AElfContextType;
  portkeyInfo?: PortkeyInfo;
  discoverInfo?: DiscoverInfo;
  accountInfoSync: {
    syncCompleted: boolean;
    holderInfo: IHolderInfo | undefined;
  };
};

export type WalletHookInterface = {
  wallet: WalletInfo;
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
