/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ConnectedWallet,
  enhancedLocalStorage,
  PORTKEYAA,
} from '@aelf-web-login/wallet-adapter-base';
import { useCallback, useMemo, useState } from 'react';

import { useWebLoginContext } from './context';
import useExternalStore from './useExternalStore';

function useConnectWallet() {
  const { instance } = useWebLoginContext();
  const stateFromStore = useExternalStore();
  const { walletInfo, isLocking, walletType, loginError, loginOnChainStatus, approvedGuardians } =
    stateFromStore ?? {};
  const {
    connect,
    disConnect,
    lock,
    getAccountByChainId,
    getWalletSyncIsCompleted,
    callSendMethod,
    callViewMethod,
    sendMultiTransaction,
    getSignature,
    clearManagerReadonlyStatus,
    checkLoginStatus,
  } = instance;
  const [connecting, setConnecting] = useState(false);

  const isConnected = useMemo(() => {
    if (enhancedLocalStorage.getItem(ConnectedWallet) === PORTKEYAA) {
      return !!walletInfo;
    }
    return !!enhancedLocalStorage.getItem(ConnectedWallet) || !!walletInfo;
  }, [walletInfo]);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    const rs = await connect();
    setConnecting(false);
    return rs;
  }, [connect]);

  const disConnectWallet = useCallback(async () => {
    const rs = await disConnect();
    return rs;
  }, [disConnect]);

  return {
    connectWallet,
    disConnectWallet,
    connecting,

    walletInfo,
    isLocking,
    walletType,
    isConnected,
    loginError,
    loginOnChainStatus,
    approvedGuardians,

    lock,
    getAccountByChainId,
    getWalletSyncIsCompleted,
    callSendMethod,
    callViewMethod,
    getSignature,
    sendMultiTransaction,
    clearManagerReadonlyStatus,
    checkLoginStatus,
  };
}

export default useConnectWallet;
