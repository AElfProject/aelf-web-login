export enum WalletStateEnum {
  // Wallet plug-in detected
  Detected = 'detected',
  // Wallet plug-in not detected
  NotDetected = 'not-detected',
  // Loadable wallets do not require detection and are considered always available
  Loadable = 'loadable',
}

export enum LoginStateEnum {
  Lock = 'lock',
  Logining = 'logining',
  Logined = 'logined',
  Logouting = 'logouting',
}

export type TWalletInfo = {
  name?: string;
  address: string;
  extraInfo?: {
    [key: string]: any;
  };
};

export type TChainId = 'AELF' | 'tDVV' | 'tDVW';

export type TSignatureParams = {
  appName: string;
  address: string;
  signInfo: string;
  hexToBeSign?: string;
};

export interface ICallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
}
