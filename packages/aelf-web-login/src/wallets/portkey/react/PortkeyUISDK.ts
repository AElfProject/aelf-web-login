import { DIDWalletInfo, Theme } from '@portkey/did-ui-react';
import { ChainType, NetworkType } from '@portkey/provider-types';
import { PortkeySDKLoginType } from '../../../types';
import { PortkeySDK } from '../PortkeySDK';

export type PortkeyState = {
  theme?: Theme;
  sandboxId?: string;
  networkType: NetworkType;
  chainType: ChainType;
};

export class PortkeyUISDK extends PortkeySDK {
  readonly portkeyState: PortkeyState;

  constructor(portkeyState: PortkeyState) {
    super();
    this.portkeyState = portkeyState;
  }

  login(): Promise<void>;
  login(type: PortkeySDKLoginType): Promise<void>;
  login(type: PortkeySDKLoginType = 'Default'): Promise<void> {
    throw new Error('Method not implemented.');
  }
  logout(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  onFinish(didWalletInfo: DIDWalletInfo) {
    throw new Error('Method not implemented.');
  }

  onError(error: any) {
    throw new Error('Method not implemented.');
  }

  onCancel() {
    throw new Error('Method not implemented.');
  }
}
