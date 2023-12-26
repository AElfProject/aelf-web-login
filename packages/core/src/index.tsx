import { WebLoginInstance } from './injectPortkey';
import WebLoginProvider, { useWebLogin, WebLoginContext } from './context';
import { getConfig, setGlobalConfig } from './config';
import { WalletType, WebLoginEvents, WebLoginState } from './constants';
import useGetAccount from './hooks/useGetAccount';
import usePortkeyLock from './hooks/usePortkeyLock';
import useCallContract from './hooks/useCallContract';
import { CallContractParams } from './types';
export {
  WebLoginInstance,
  WebLoginProvider,
  useWebLogin,
  WebLoginContext,
  setGlobalConfig,
  getConfig,
  WebLoginState,
  WalletType,
  WebLoginEvents,
  useGetAccount,
  usePortkeyLock,
  useCallContract,
};
export type { CallContractParams };
