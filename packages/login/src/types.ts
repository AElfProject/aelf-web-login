import type { AElfContextType } from '@aelf-react/core/dist/types';
import { DIDWalletInfo, ISignIn } from '@portkey/did-ui-react';
import type { IHolderInfo } from '@portkey/services';
import type { Accounts, ChainIds, IPortkeyProvider } from '@portkey/provider-types';
import type { RefAttributes } from 'react';
import { ConfirmLogoutDialogProps } from './components/CofirmLogoutDialog';
import { ChainId, SendOptions } from '@portkey/types';
import { SignInProps, TDesign } from '@portkey/did-ui-react';
import { IPortkeyContract } from '@portkey/contracts';

/**
 * WebLoginProvider types
 */
export type ExtraWalletNames = 'discover' | 'elf';

export type NightElfOptions = {
  connectEagerly: boolean;
  useMultiChain?: boolean;
  onClick?: OnClickCryptoWallet;
  onPluginNotFound?: PluginNotFoundCallback;
};

export type PortkeyOptions = {
  autoShowUnlock: boolean;
  checkAccountInfoSync: boolean;
  SignInComponent?: React.FC<SignInProps & RefAttributes<ISignIn>>;
  ConfirmLogoutDialog?: React.FC<Partial<ConfirmLogoutDialogProps>>;
  design?: TDesign;
};

export type PluginNotFoundCallback = (openPluginStorePage: () => void) => void;
export type OnClickCryptoWallet = (continueDefaultBehaviour: () => void) => void;

export type DiscoverOptions = {
  autoRequestAccount: boolean;
  autoLogoutOnDisconnected: boolean;
  autoLogoutOnNetworkMismatch: boolean;
  autoLogoutOnAccountMismatch: boolean;
  autoLogoutOnChainMismatch: boolean;
  onClick?: OnClickCryptoWallet;
  onPluginNotFound?: PluginNotFoundCallback;
};
interface ICommonConfig {
  showClose?: boolean;
  iconSrc?: string;
}
export type WebLoginProviderProps = {
  nightElf: NightElfOptions;
  portkey: PortkeyOptions;
  discover: DiscoverOptions;
  extraWallets: Array<ExtraWalletNames>;
  children: React.ReactNode;
  commonConfig?: ICommonConfig;
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
 * switch wallet
 */
export type DoSwitchFunc = (commit: () => Promise<void>, rollback: () => Promise<void>) => Promise<void>;
export type SwitchWalletFunc = (doSwitch: DoSwitchFunc) => Promise<void>;
export interface LogoutOptions {
  noModal?: boolean;
}
/**
 * useWebLogin
 */
export type WalletHookInterface = {
  wallet: WalletInfo;
  loginEagerly: () => void;
  login: () => void;
  loginBySwitch: () => void;
  logout: (options?: LogoutOptions) => void;
  logoutSilently: () => Promise<void>;
  switchWallet: SwitchWalletFunc;
  // TODO: move this to new hook
  callContract<T, R>(params: CallContractParams<T>): Promise<R>;
  getSignature(params: SignatureParams): Promise<SignatureData>;
  changePortkeyVersion?: () => void;
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
  contractHookId: string;
  callViewMethod<T, R>(params: CallContractParams<T>): Promise<R>;
  callSendMethod<T, R>(params: CallContractParams<T>, sendOptions: SendOptions | undefined): Promise<R>;
};

/**
 * useContract
 */
export type ContractHookOptions = {
  chainId?: string;
  rpcUrl?: string;
  cache?: boolean;
};

export interface IPortkeySendAdapterProps<T> {
  caContract: IPortkeyContract;
  didWalletInfo: DIDWalletInfo;
  params: CallContractParams<T>;
  chainId: ChainId;
  sendOptions?: SendOptions;
}
