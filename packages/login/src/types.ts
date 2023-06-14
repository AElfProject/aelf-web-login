import type { AElfContextType } from '@aelf-react/core/dist/types';
import type { DIDWalletInfo } from '@portkey/did-ui-react';
import type { IHolderInfo } from '@portkey/services';
import type { ChainIds } from '@portkey/provider-types';

/**
 * WebLoginProvider types
 */
export type ExtraWalletNames = 'discover' | 'elf';

export type NightElfOptions = {
  connectEagerly: boolean;
};

export type PortkeyOptions = {
  autoShowUnlock: boolean;
  checkAccountInfoSync: boolean;
};

export type DiscoverOptions = {
  autoRequestAccount: boolean;
  autoLogoutOnDisconnected: boolean;
  autoLogoutOnNetworkMismatch: boolean;
  autoLogoutOnAccountMismatch: boolean;
  autoLogoutOnChainMismatch: boolean;
};

export type WebLoginProviderProps = {
  nightElf: NightElfOptions;
  portkey: PortkeyOptions;
  discover: DiscoverOptions;
  extraWallets: Array<ExtraWalletNames>;
  children: React.ReactNode;
};

/**
 * callContract
 */

export interface CallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
}

export type CallContractFunc<T, R> = (params: CallContractParams<T>) => Promise<R>;

/**
 * getSignature
 */
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

export type GetSignatureFunc = (params: SignatureParams) => Promise<SignatureData>;

/**
 * wallet
 */

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
    holderInfo?: IHolderInfo;
    chainIds?: ChainIds;
  };
};

/**
 * useWebLogin
 */
export type WalletHookInterface = {
  wallet: WalletInfo;
  loginEagerly: () => void;
  login: () => void;
  logout: () => void;
  // TODO: move this to new hook
  callContract<T, R>(params: CallContractParams<T>): Promise<R>;
  getSignature(params: SignatureParams): Promise<SignatureData>;
};
