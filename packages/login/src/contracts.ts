import { getContractBasic } from '@portkey/contracts';
import { DIDWalletInfo, did } from '@portkey/did-ui-react';
import waitNextFrame from './utils/waitNextFrame';

export type Contract = {
  [key: string]: (...args: any[]) => Promise<any>;
};

export interface ContractProvider {
  call<T, R>(methodName: string, args: T): Promise<R>;
}

export class AElfContractProvider implements ContractProvider {
  private _contract: any;
  private _waitingContract = false;

  constructor(private _chain: any, public address: string, public wallet: { address: string }) {}

  async resolveContract(): Promise<Contract> {
    while (this._waitingContract) {
      await waitNextFrame();
    }
    if (this._contract) {
      return this._contract;
    }
    this._waitingContract = true;
    try {
      console.log(this._chain, this.address);
      this._contract = await this._chain.contractAt(this.address, this.wallet);
    } finally {
      this._waitingContract = false;
    }
    return this._contract;
  }

  async call<T, R>(methodName: string, args: T): Promise<R> {
    const contract = await this.resolveContract();
    console.log(contract, methodName, args);
    return await contract[methodName](args);
  }
}

export class PortkeyContractProvider implements ContractProvider {
  private _waitingContract = false;
  private _contract: any;

  constructor(public chainId: string, public didWalletInfo: DIDWalletInfo, public address: string) {}

  async resolveCAContract() {
    while (this._waitingContract) {
      await waitNextFrame();
    }
    if (this._contract) {
      return this._contract;
    }
    this._waitingContract = true;

    try {
      const chainsInfo = await did.services.getChainsInfo();
      const chainInfo = chainsInfo.find((chain) => chain.chainId === this.chainId);
      if (!chainInfo) {
        throw new Error(`chain is not running: ${this.chainId}`);
      }

      // const aelf = new AElf(new AElf.providers.HttpProvider(chainInfo.endPoint));
      const contract = await getContractBasic({
        contractAddress: chainInfo.caContractAddress,
        account: this.didWalletInfo.walletInfo,
        rpcUrl: chainInfo.endPoint,
      });
      this._contract = contract;
      return contract;
    } finally {
      this._waitingContract = false;
    }
  }

  async call<T, R>(methodName: string, args: T): Promise<R> {
    const caContract = await this.resolveCAContract();
    return await caContract.callSendMethod('ManagerForwardCall', this.didWalletInfo.walletInfo.address, {
      caHash: this.didWalletInfo.caInfo.caHash,
      contractAddress: this.address,
      methodName: methodName,
      args: args,
    });
  }
}
