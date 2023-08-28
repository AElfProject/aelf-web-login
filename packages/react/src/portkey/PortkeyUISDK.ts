import { DIDWalletInfo, SignInInterface, did } from '@portkey/did-ui-react';
import { PortkeySDK, makeError, ERR_CODE, CancelablePromise, newCancelablePromise } from '@aelf-web-login/core';
import { RefObject } from 'react';
import { PortkeyState, PromiseHolder } from '../types';
import { ChainId } from '@portkey/types';

const ORIGIN_CHAIN_ID_KEY = `AElf.PortkeyUISDK.OriginChainId`;

export class PortkeyUISDK extends PortkeySDK {
  readonly portkeyState: PortkeyState;
  readonly signInfRef: RefObject<SignInInterface>;
  setUnlockOpen: (open: boolean) => void;

  private _promiseHolder: PromiseHolder;

  constructor(
    portkeyState: PortkeyState,
    signInfRef: RefObject<SignInInterface>,
    setUnlockOpen: (open: boolean) => void,
  ) {
    super();
    this.portkeyState = portkeyState;
    this.signInfRef = signInfRef;
    this.setUnlockOpen = setUnlockOpen;
  }

  loginEagerly(): Promise<void> {
    if (this.canLoginEagerly()) {
      Promise.reject(makeError(ERR_CODE.LOGIN_EAGERLY_FAIL));
    }
    this.loginState = 'logining';
    this.setUnlockOpen(true);
    return new Promise((resolve, reject) => {
      this._promiseHolder = {
        resolve: () => {
          this.setUnlockOpen(false);
          resolve();
        },
        reject,
      };
    });
  }

  login(): CancelablePromise<void> {
    if (this.portkeyState.uiType !== 'Modal') {
      throw new Error('login only support Modal uiType');
    }
    if (this.loginState !== 'initial') {
      throw new Error(`call login when loginState is not initial ${this.loginState}`);
    }
    this.loginState = 'logining';
    const signIn = this.signInfRef.current!;
    signIn.setOpen(true);

    return newCancelablePromise((resolve, reject, onCancel) => {
      onCancel(() => {
        this.loginState = 'initial';
        this._promiseHolder = undefined;
        signIn.setOpen(false);
      });
      this._promiseHolder = {
        resolve: () => {
          signIn.setOpen(false);
          resolve();
        },
        reject: (error: any) => {
          reject(error);
        },
      };
    });
  }

  async logout(): Promise<void> {
    if (this.loginState !== 'logined') {
      throw new Error(`call logout when loginState is ${this.loginState}`);
    }
    const originChainId = localStorage.getItem(ORIGIN_CHAIN_ID_KEY);
    if (originChainId && this.walletInfo.did) {
      await this.walletInfo.did.logout({
        chainId: originChainId as ChainId,
      });
    }
    this.setLoginEagerly(false);
    localStorage.removeItem(ORIGIN_CHAIN_ID_KEY);
    this.loginState = 'initial';
  }

  onFinish(didWalletInfo: DIDWalletInfo) {
    if (this.loginState !== 'logining') {
      console.warn('onFinish called when loginState is not logining', this.loginState);
      return;
    }
    this.loginState = 'logined';
    this.walletInfo = {
      address: didWalletInfo?.caInfo.caAddress || '',
      originChainId: didWalletInfo.chainId,
      did: did,
    };
    localStorage.setItem(ORIGIN_CHAIN_ID_KEY, didWalletInfo.chainId);
    this.setLoginEagerly(true);
    this._promiseHolder?.resolve();
  }

  onError(error: any) {
    console.error(error);
    console.warn('onError called when loginState is not logining', this.loginState);
    this.emit('commonError', {
      code: ERR_CODE.PORTKEY_SDK_COMMON_ERROR,
      error: error,
    });
  }

  onUnlock() {
    this.loginState = 'logined';
    this.walletInfo = {
      address: did.didWallet!.caInfo[this.portkeyState.defaultChainId]?.caAddress || '',
      originChainId: localStorage.getItem(ORIGIN_CHAIN_ID_KEY) || undefined,
      did: did,
    };
    this._promiseHolder?.resolve();
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
