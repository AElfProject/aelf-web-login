import { DIDWalletInfo, did } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';
import { useAElfReact } from '@aelf-react/core';
import { AElfContextState } from '@aelf-react/core/dist/types';
import { WalletInterface } from './types';

export abstract class AbstractWallet<T> implements WalletInterface {
  public readonly walletInfo: T;

  constructor(walletInfo: T) {
    this.walletInfo = walletInfo;
  }

  abstract initialize(): Promise<void>;
}

export class PortkeyWallet extends AbstractWallet<DIDWalletInfo> {
  static checkLocal(appName: string): boolean {
    return !!localStorage.getItem(appName);
  }

  public readonly appName: string;
  public readonly chainId: ChainId;

  constructor(appName: string, chainId: ChainId, walletInfo: DIDWalletInfo) {
    super(walletInfo);
    this.appName = appName;
    this.chainId = chainId;
  }

  async initialize(): Promise<void> {
    console.log(this.walletInfo.chainId, this.chainId);
    if (this.walletInfo.chainId !== this.chainId) {
      const caInfo = await did.didWallet.getHolderInfoByContract({
        caHash: this.walletInfo.caInfo.caHash,
        chainId: this.chainId,
      });
      this.walletInfo.caInfo = {
        caAddress: caInfo.caAddress,
        caHash: caInfo.caHash,
      };
    }
    console.log(did);
    await did.save(this.walletInfo.pin, this.appName);
  }
}

export class BridgedWallet extends AbstractWallet<AElfContextState['aelfBridges']> {
  constructor(walletInfo: any) {
    super(walletInfo);
  }

  initialize(): Promise<void> {
    return Promise.resolve();
  }
}

export function useCheckWallet(): () => Promise<WalletInterface | undefined> {
  const aelfReact = useAElfReact();
  return async () => {
    console.log(aelfReact);
    if (aelfReact.isActive) {
    }
    return undefined;
  };
}
