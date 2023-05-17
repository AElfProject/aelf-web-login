import { DIDWalletInfo, did } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';
import { useAElfReact } from '@aelf-react/core';
import { AElfContextState } from '@aelf-react/core/dist/types';
import { CallContractParams, WalletInterface } from './types';
import { AElfContractProvider, ContractProvider, PortkeyContractProvider } from './contracts';

export enum WalletState {
  UNINITIALIZED = 'UNINITIALIZED',
  INITIALIZING = 'INITIALIZING',
  INITIALIZED = 'INITIALIZED',
  ERROR = 'ERROR',
}

export abstract class AbstractWallet<Info> implements WalletInterface {
  public error: unknown;
  public info!: Info;
  public state: WalletState = WalletState.UNINITIALIZED;

  private readonly _contracts: Map<string, ContractProvider> = new Map();

  isInitialized() {
    return this.state === WalletState.INITIALIZED;
  }
  isInitializing() {
    return this.state == WalletState.INITIALIZING;
  }

  public setInfo(info: Info) {
    this.info = info;
  }

  public async initialize() {
    this.state = WalletState.INITIALIZING;
    try {
      await this.safeInitialize();
      this.state = WalletState.INITIALIZED;
    } catch (error) {
      this.error = error;
      this.state = WalletState.ERROR;
    }
  }
  protected abstract safeInitialize(): Promise<void>;

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

export type PortkeyWalletInfo = {
  appName: string;
  chainId: ChainId;
  walletInfo: DIDWalletInfo;
};

export class PortkeyWallet extends AbstractWallet<PortkeyWalletInfo> {
  static checkLocal(appName: string): boolean {
    return !!localStorage.getItem(appName);
  }

  async safeInitialize(): Promise<void> {
    const info = this.info;
    if (info.walletInfo.chainId !== info.chainId) {
      const caInfo = await did.didWallet.getHolderInfoByContract({
        caHash: info.walletInfo.caInfo.caHash,
        chainId: info.chainId,
      });
      info.walletInfo.caInfo = {
        caAddress: caInfo.caAddress,
        caHash: caInfo.caHash,
      };
    }
    await did.save(info.walletInfo.pin, info.appName);
  }

  logout(): Promise<void> {
    did.reset();
    return Promise.resolve();
  }

  getContract(contractAddress: string): ContractProvider {
    return new PortkeyContractProvider(this.info.chainId, this.info.walletInfo, contractAddress);
  }
}

export type ElfWalletInfo = {
  chainId: string;
  aelfContext: AElfContextState;
};

export class ElfWallet extends AbstractWallet<ElfWalletInfo> {
  chain(): any {
    return this.info.aelfContext.aelfBridges![this.info.chainId!]!.chain;
  }

  async safeInitialize(): Promise<void> {
    console.log(this.info);
    const chainInfo = await this.chain().getChainStatus();
    console.log(chainInfo);
    return Promise.resolve();
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  getContract(contractAddress: string): ContractProvider {
    console.log(this.info, this.info.aelfContext.account);
    const bridges = this.info.aelfContext.aelfBridges!;
    return new AElfContractProvider(bridges[this.info.chainId!]!.chain, contractAddress, {
      address: this.info.aelfContext.account!,
    });
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
