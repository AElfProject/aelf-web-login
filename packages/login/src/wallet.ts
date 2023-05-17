import { DIDWalletInfo, did } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';
import { useAElfReact } from '@aelf-react/core';
import { AElfContextState } from '@aelf-react/core/dist/types';
import { CallContractParams, WalletInterface } from './types';
import { AElfContractProvider, ContractProvider, PortkeyContractProvider } from './contracts';

export abstract class AbstractWallet<Info> implements WalletInterface {
  public readonly walletInfo: Info;
  private readonly _contracts: Map<string, ContractProvider> = new Map();

  constructor(walletInfo: Info) {
    this.walletInfo = walletInfo;
  }

  abstract initialize(): Promise<void>;
  abstract logout(): Promise<void>;
  abstract getContract(contractAddress: string): ContractProvider;

  callContract<T, R>(params: CallContractParams<T>): Promise<R> {
    let contract = this._contracts.get(params.contractAddress);
    if (!contract) {
      contract = this.getContract(params.contractAddress);
    }
    return contract.call(params.methodName, params.args);
  }
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
    console.log(did, this.walletInfo);
    console.log(this.walletInfo.pin, this.appName);
    await did.save(this.walletInfo.pin, this.appName);
  }

  logout(): Promise<void> {
    did.reset();
    return Promise.resolve();
  }

  getContract(contractAddress: string): ContractProvider {
    return new PortkeyContractProvider(this.chainId, this.walletInfo, contractAddress);
  }
}

export class ElfWallet extends AbstractWallet<AElfContextState['aelfBridges']> {
  constructor(walletInfo: any, private _chain: any) {
    super(walletInfo);
  }

  initialize(): Promise<void> {
    return Promise.resolve();
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  getContract(contractAddress: string): ContractProvider {
    return new AElfContractProvider(this._chain, contractAddress);
  }
}

export function useCheckWallet(): () => Promise<WalletInterface | undefined> {
  const aelfReact = useAElfReact();
  return async () => {
    console.log(aelfReact);
    if (aelfReact.isActive) {
      // TODO: check wallet
    }
    return undefined;
  };
}
