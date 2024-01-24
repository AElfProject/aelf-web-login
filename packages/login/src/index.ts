import WebLoginProvider, { useWebLogin, WebLoginContext } from './context';
import useLoginState from './hooks/useLoginState';
import useWebLoginEvent from './hooks/useWebLoginEvent';
import useMultiWallets from './hooks/useMultiWallets';
import useCallContract from './hooks/useCallContract';
import usePortkeyLock from './hooks/usePortkeyLock';
import usePortkeyPreparing from './hooks/usePortkeyPreparing';
import useGetAccount from './hooks/useGetAccount';

export * as PortkeyDid from '@portkey/did-ui-react';
export * as PortkeyDidV1 from '@portkey-v1/did-ui-react';

import getContractBasicAsync from './utils/getContractBasicAsync';
import getContractBasicAsyncV1 from './utils/getContractBasicAsync/indexV1';
import detectDiscoverProvider from './wallets/discover/detectProvider';
import detectNightElf from './wallets/elf/detectNightElf';

export * from './utils/pluginPages';
export * from './wallets/types';
export * from './types';
export * from './constants';
export * from './config';
export * from './errors';
export * from './hooks/useMultiWallets';
export * from './hooks/useCallContract';
export * from './context';
export type { ConfirmLogoutDialogProps } from './components/CofirmLogoutDialog';

export {
  WebLoginContext,
  WebLoginProvider,
  useWebLogin,
  useLoginState,
  useWebLoginEvent,
  useMultiWallets,
  useCallContract,
  usePortkeyLock,
  usePortkeyPreparing,
  useGetAccount,
  getContractBasicAsync,
  getContractBasicAsyncV1,
  detectDiscoverProvider,
  detectNightElf,
};
