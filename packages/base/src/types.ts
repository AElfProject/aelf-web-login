import { BaseGuardianItem } from '@portkey/did-ui-react';
import { IContract, LoginStatusEnum, SendOptions } from '@portkey/types';

export enum WalletStateEnum {
  // Wallet plug-in detected
  Detected = 'detected',
  // Wallet plug-in not detected
  NotDetected = 'not-detected',
  // Loadable wallets do not require detection and are considered always available
  Loadable = 'loadable',
}

export enum LoginStateEnum {
  INITIAL = 'INITIAL',
  LOCK = 'LOCK',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
}

export type TWalletInfo =
  | {
      name?: string;
      address: string;
      extraInfo?: {
        [key: string]: any;
      };
    }
  | undefined;

export type TChainId = 'AELF' | 'tDVV' | 'tDVW';

/**
 * getSignature
 */
export type TSignatureParams = {
  appName: string;
  address: string;
  signInfo: string;
  hexToBeSign?: string;
};

export type TWalletError = {
  name: string;
  code: number;
  message: string;
  nativeError?: any;
};

export interface ICallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
  chainId?: TChainId;
  sendOptions?: SendOptions;
  approvedGuardians?: BaseGuardianItem[];
}

export interface ISendOrViewAdapter<T> extends ICallContractParams<T> {
  caContract: IContract;
  approvedGuardians: ICallContractParams<T>['approvedGuardians'];
  type?: string;
}

export enum WalletTypeEnum {
  unknown = 'Unknown',
  elf = 'NightElf',
  aa = 'PortkeyAA',
  discover = 'PortkeyDiscover',
}
export enum SignInDesignEnum {
  SocialDesign = 'SocialDesign',
  CryptoDesign = 'CryptoDesign',
  Web2Design = 'Web2Design',
}

export enum NetworkEnum {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

type MultiChainInfo = Partial<{
  [x in TChainId]: {
    chainUrl: string;
    contractAddress: string;
  };
}>;

type MultiParams<T> = Partial<{
  [x in TChainId]: {
    method: string;
    params: T;
  };
}>;

export interface IMultiTransactionParams<T> {
  multiChainInfo: MultiChainInfo;
  gatewayUrl: string;
  chainId: TChainId;
  params: MultiParams<T>;
}

export interface IMultiTransactionResult {
  string: string[];
}

export enum OperationTypeEnum {
  unknown = 0,
  register = 1,
  communityRecovery = 2,
  addGuardian = 3,
  deleteGuardian = 4,
  editGuardian = 5,
  removeOtherManager = 6,
  setLoginAccount = 7,
  managerApprove = 8,
  modifyTransferLimit = 9,
  transferApprove = 10,
  unsetLoginAccount = 11,
  setupBackupMailbox = 13,
}

export { LoginStatusEnum };
