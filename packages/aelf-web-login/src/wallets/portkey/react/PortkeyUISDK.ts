import { DIDWalletInfo, Theme, SignInInterface } from '@portkey/did-ui-react';
import { ChainType, NetworkType } from '@portkey/provider-types';
import { PortkeySDKLoginType } from '../../../types';
import { PortkeySDK } from '../PortkeySDK';
import { RefObject } from 'react';

export type PortkeyState = {
  theme?: Theme;
  sandboxId?: string;
  networkType: NetworkType;
  chainType: ChainType;
};

export type PromiseHolder =
  | {
      resolve: () => void;
      reject: (error: any) => void;
    }
  | undefined;

export class PortkeyUISDK extends PortkeySDK {
  readonly portkeyState: PortkeyState;
  readonly signInfRef: RefObject<SignInInterface>;

  private _promiseHolder: PromiseHolder;

  constructor(portkeyState: PortkeyState, signInfRef: RefObject<SignInInterface>) {
    super();
    this.portkeyState = portkeyState;
    this.signInfRef = signInfRef;
  }

  login(): Promise<void> {
    if (this.loginState !== 'initial') {
      throw new Error(`call login when loginState is not initial ${this.loginState}`);
    }
    this.loginState = 'logining';
    const signIn = this.signInfRef.current!;
    signIn.setOpen(true);

    return new Promise((resolve, reject) => {
      this._promiseHolder = {
        resolve,
        reject,
      };
    });
  }

  logout(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  onFinish(didWalletInfo: DIDWalletInfo) {
    if (this.loginState !== 'logining') {
      console.warn('onFinish called when loginState is not logining', this.loginState);
      return;
    }
    this.loginState = 'logined';
    this.walletInfo = {
      address: didWalletInfo?.caInfo.caAddress || '',
      didWalletInfo,
    };
    this._promiseHolder?.resolve();
  }

  onError(error: any) {
    if (this.loginState !== 'logining') {
      console.warn('onError called when loginState is not logining', this.loginState);
      return;
    }
    this.loginState = 'initial';
    this._promiseHolder?.reject(error);
  }

  onCancel() {
    if (this.loginState !== 'logining') {
      console.warn('onCancel called when loginState is not logining', this.loginState);
      return;
    }
    this.loginState = 'initial';
    this._promiseHolder?.reject('cancel');
  }
}
