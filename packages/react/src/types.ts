import type { TDesign, Theme, UI_TYPE } from '@portkey/did-ui-react';
import type { ChainId, ChainType, NetworkType } from '@portkey/provider-types';

export type { Theme } from '@portkey/did-ui-react';

export type PortkeyState = {
  defaultChainId: ChainId;
  theme?: Theme;
  networkType: NetworkType;
  chainType: ChainType;
  uiType: UI_TYPE;
  design: TDesign;
};

export type PromiseHolder =
  | {
      resolve: () => void;
      reject: (error: any) => void;
    }
  | undefined;
