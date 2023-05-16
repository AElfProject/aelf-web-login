import { getContractBasic } from '@portkey/contracts';
import { DIDWalletInfo, did } from '@portkey/did-ui-react';
import waitNextFrame from './utils/waitNextFrame';

export interface ContractProvider {
  call<T, R>(methodName: string, args: T): Promise<R>;
}

export class AElfContractProvider implements ContractProvider {
  private _contract: any;
  private _waitingContract: boolean = false;

  constructor(private _chain: any, public address: string) {}

  async resolveContract() {
    while (this._waitingContract) {
      await waitNextFrame();
    }
    if (this._contract) {
      return this._contract;
    }
    this._waitingContract = true;
    try {
      this._contract = await this._chain.contractAt(this.address);
    } finally {
      this._waitingContract = false;
    }
    return this._contract;
  }

  async call<T, R>(methodName: string, args: T): Promise<R> {
    return await this.resolveContract()[methodName](args);
  }
}

export class PortkeyContractProvider implements ContractProvider {
  private _waitingContract: boolean = false;
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
      const chainInfo = chainsInfo.find(chain => chain.chainId === this.chainId);
      if (!chainInfo) {
        throw new Error(`chain is not running: ${this.chainId}`);
      }

      // const aelf = new AElf(new AElf.providers.HttpProvider(chainInfo.endPoint));
      await getContractBasic({
        contractAddress: chainInfo.caContractAddress,
        account: this.didWalletInfo.walletInfo,
        rpcUrl: chainInfo.endPoint,
      });
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
