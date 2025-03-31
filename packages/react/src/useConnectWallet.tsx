/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ConnectedWallet,
  enhancedLocalStorage,
  PORTKEY_WEB_WALLET,
} from '@aelf-web-login/wallet-adapter-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useWebLoginContext } from './context';
import useExternalStore from './useExternalStore';
import { useModalDispatch } from './useModal/hooks';
import { basicModalView } from './useModal/actions';
import { useModal } from './useModal';

function useConnectWallet() {
  const { instance } = useWebLoginContext();
  const stateFromStore = useExternalStore();
  const { walletInfo, isLocking, walletType, loginError, loginOnChainStatus } =
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
    goAssets,
  } = instance;
  const [connecting, setConnecting] = useState(false);
  const dispatch = useModalDispatch();
  const isConnected = useMemo(() => {
    if (enhancedLocalStorage.getItem(ConnectedWallet) === PORTKEY_WEB_WALLET) {
      return !!walletInfo;
    }
    return !!enhancedLocalStorage.getItem(ConnectedWallet) || !!walletInfo;
  }, [walletInfo]);

  const [{ connectInfo, isDisconnect }] = useModal();

  const connectResolve = useRef<(value: string) => void>();
  const connectReject = useRef<(reason?: any) => void>();
  const disConnectResolve = useRef<(value: boolean) => void>();

  useEffect(() => {
    if (connectInfo) {
      if (connectInfo.errorMessage) connectReject.current?.(connectInfo.errorMessage);
      if (connectInfo.name) connectResolve.current?.(connectInfo.name);
    }
  }, [connectInfo]);

  useEffect(() => {
    if (typeof isDisconnect !== 'undefined') {
      disConnectResolve.current?.(isDisconnect);
    }
  }, [connectInfo, isDisconnect]);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    const walletName: string = await new Promise((resolve, reject) => {
      connectResolve.current = resolve;
      connectReject.current = reject;
      const localWalletName = enhancedLocalStorage.getItem(ConnectedWallet);
      if (localWalletName) return resolve(localWalletName);
      if (!localWalletName) {
        dispatch(basicModalView.setWalletDialog.actions(true));
      }
    });
    const rs = await connect(walletName);

    setConnecting(false);
    return rs;
  }, [connect, dispatch]);

  const disConnectWallet = useCallback(async () => {
    const isDisconnect = await new Promise((resolve) => {
      if (instance.activeWallet?.disconnectConfirm) {
        disConnectResolve.current = resolve;
        dispatch(basicModalView.setDisconnectDialogVisible.actions(true));
      } else {
        resolve(true);
      }
    });
    console.log(isDisconnect, 'isDisconnect===');
    if (!isDisconnect) return false;
    const rs = await disConnect();
    return rs;
  }, [disConnect, dispatch, instance.activeWallet?.disconnectConfirm]);

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

    lock,
    getAccountByChainId,
    getWalletSyncIsCompleted,
    callSendMethod,
    callViewMethod,
    getSignature,
    goAssets,
    sendMultiTransaction,
  };
}

export default useConnectWallet;
