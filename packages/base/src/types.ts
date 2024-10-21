import { SendOptions, IContract } from '@portkey/types';

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
}

export interface ISendOrViewAdapter<T> extends ICallContractParams<T> {
  caContract: IContract;
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
