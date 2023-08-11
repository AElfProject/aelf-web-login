import { DIDWalletInfo } from '@portkey/did-ui-react';
import { PortkeySDKLoginType } from '../../types';

export class PortkeySDKLoginResult {
  code: number;
  message: string;
  walletInfo?: DIDWalletInfo | undefined;

  constructor(code: number, message: string, walletInfo?: DIDWalletInfo | undefined) {
    this.code = code;
    this.message = message;
    this.walletInfo = walletInfo;
  }
}

export abstract class PortkeySDKLoginProcessorBase {
  abstract type: PortkeySDKLoginType;

  login(): Promise<DIDWalletInfo> {
    return new Promise((resolve, reject) => {
      this._processLogin((result) => {
        if (result.code === 0) {
          resolve(result.walletInfo!);
        } else {
          reject(result);
        }
      });
    });
  }

  protected abstract _processLogin(complete: (result: PortkeySDKLoginResult) => void): void;
}
