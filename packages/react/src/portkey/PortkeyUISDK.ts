import { DIDWalletInfo, SignInInterface } from '@portkey/did-ui-react';
import { PortkeySDK, makeError, ERR_CODE } from '@aelf-web-login/core';
import { RefObject } from 'react';
import { PortkeyState, PromiseHolder } from '../types';

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
    this._promiseHolder?.reject(makeError(ERR_CODE.USER_CANCEL));
  }
}
