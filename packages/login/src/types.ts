import type { AElfContextType } from '@aelf-react/core/dist/types';
import type { DIDWalletInfo } from '@portkey/did-ui-react';
import type { IHolderInfo } from '@portkey/services';
import type { Accounts, ChainIds, IPortkeyProvider } from '@portkey/provider-types';
import { SignInProps } from '@portkey/did-ui-react/dist/_types/src/components/SignIn';
import { UnlockProps } from '@portkey/did-ui-react/dist/_types/src/components/Unlock';
import { ReactElement } from 'react';

/**
 * WebLoginProvider types
 */
export type ExtraWalletNames = 'discover' | 'elf';

export type NightElfOptions = {
  connectEagerly: boolean;
  onPluginNotFound?: PluginNotFoundCallback;
};

export type PortkeyComponentProps = JSX.IntrinsicAttributes & (SignInProps | UnlockProps);
export type PortkeyComponentRenderer = <P extends PortkeyComponentProps>(
  Component: React.FC<P>,
  props: P,
) => ReactElement;
export type PortkeyOptions = {
  autoShowUnlock: boolean;
  checkAccountInfoSync: boolean;
  renderPortkeyComponent?: PortkeyComponentRenderer;
};

export type PluginNotFoundCallback = (openPluginStorePage: () => void) => void;

export type DiscoverOptions = {
  autoRequestAccount: boolean;
  autoLogoutOnDisconnected: boolean;
  autoLogoutOnNetworkMismatch: boolean;
  autoLogoutOnAccountMismatch: boolean;
  autoLogoutOnChainMismatch: boolean;
  onPluginNotFound?: PluginNotFoundCallback;
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
  accounts: {
    [key: string]: string;
  };
};

export type DiscoverInfo = {
  address: string;
  accounts: Accounts;
  nickName?: string;
  provider?: IPortkeyProvider;
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
  loginBySwitch: () => void;
  logout: () => void;
  logoutBySwitch: () => void;
  // TODO: move this to new hook
  callContract<T, R>(params: CallContractParams<T>): Promise<R>;
  getSignature(params: SignatureParams): Promise<SignatureData>;
};

/**
 * useCallContract
 */
export type CallContractHookOptions = {
  chainId?: string;
  rpcUrl?: string;
  cache?: boolean;
};

export type CallContractHookInterface = {
  callViewMethod<T, R>(params: CallContractParams<T>): Promise<R>;
  callSendMethod<T, R>(params: CallContractParams<T>): Promise<R>;
};
