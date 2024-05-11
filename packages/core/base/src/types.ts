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

export interface ICallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
}

export type TWalletError = {
  name: string;
  code: number;
  message: string;
  nativeError?: any;
};
