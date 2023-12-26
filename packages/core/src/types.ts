import { DIDWalletInfo } from '@portkey/did-ui-react';
import type { IHolderInfo } from '@portkey/services';
import type { Accounts, ChainIds, IPortkeyProvider } from '@portkey/provider-types';
import { ChainId, SendOptions } from '@portkey/types';
import { IPortkeyContract } from '@portkey/contracts';

export type PortkeyInfo = DIDWalletInfo & {
  nickName: string;
  accounts: {
    [key: string]: string;
  };
};
export type WalletInfo = {
  name?: string;
  address: string;
  publicKey?: string;
  portkeyInfo?: PortkeyInfo;
  // accountInfoSync: {
  //   syncCompleted: boolean;
  //   holderInfo?: IHolderInfo;
  //   chainIds?: ChainIds;
  // };
};
export type DoSwitchFunc = (commit: () => Promise<void>, rollback: () => Promise<void>) => Promise<void>;
export type SwitchWalletFunc = (doSwitch: DoSwitchFunc) => Promise<void>;
export interface CallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
}
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
export type WalletHookInterface = {
  wallet: WalletInfo;
  // loginEagerly: () => void;
  login: () => void;
  // loginBySwitch: () => void;
  logout: () => void;
  // logoutSilently: () => Promise<void>;
  // TODO: move this to new hook
  callContract<T, R>(params: CallContractParams<T>): Promise<R>;
  getSignature(params: SignatureParams): Promise<SignatureData>;
};
export type PortkeyOptions = {
  autoShowUnlock: boolean;
  checkAccountInfoSync: boolean;
};
export type WebLoginProviderProps = {
  portkey: PortkeyOptions;
  children: React.ReactNode;
};

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
export interface IPortkeySendAdapterProps<T> {
  caContract: IPortkeyContract;
  didWalletInfo: DIDWalletInfo;
  params: CallContractParams<T>;
  chainId: ChainId;
  sendOptions?: SendOptions;
}
