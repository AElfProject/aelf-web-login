import { DIDWalletInfo } from '@portkey/did-ui-react';
import { AElfContextState } from '@aelf-react/core/dist/types';
import { WalletInterface } from './types';

export abstract class AbstractWallet<T> implements WalletInterface {
  public readonly walletInfo: T;

  constructor(walletInfo: T) {
    this.walletInfo = walletInfo;
  }
}

export class PortkeyWallet extends AbstractWallet<DIDWalletInfo> {
  constructor(walletInfo: DIDWalletInfo) {
    super(walletInfo);
  }
}

export class BridgedWallet extends AbstractWallet<AElfContextState['aelfBridges']> {
  constructor(walletInfo: any) {
    super(walletInfo);
  }
}
