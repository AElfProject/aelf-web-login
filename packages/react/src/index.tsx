import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { initBridge, IConfigProps, IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';
import VConsole from 'vconsole';

const HOOK_ERROR_MESSAGE =
  'Must call the provided initialization method`init` method before using hooks.';

export const init = (options: IConfigProps): IBridgeAPI => {
  console.log('aelf-web-login-init..............');
  if (options.baseConfig.showVconsole) {
    const vConsole = new VConsole();
  }
  const dataFromBridge = initBridge(options);
  return dataFromBridge;
};

export const WebLoginContext: React.Context<IBridgeAPI> = React.createContext<IBridgeAPI>(
  {} as IBridgeAPI,
);

interface IWebLoginProviderProps {
  children: React.ReactNode;
  bridgeAPI: IBridgeAPI;
}

export const WebLoginProvider: React.FC<IWebLoginProviderProps> = ({ children, bridgeAPI }) => {
  const { mountApp, unMountApp } = bridgeAPI ?? { mountApp: () => {}, unMountApp: () => {} };
  useEffect(() => {
    mountApp();
    return unMountApp;
  }, [mountApp, unMountApp]);
  if (!bridgeAPI) {
    return null;
  }
  return <WebLoginContext.Provider value={bridgeAPI}>{children}</WebLoginContext.Provider>;
};

export function useWebLoginContext(): IBridgeAPI {
  const bridgeAPI = React.useContext(WebLoginContext);

  if (!bridgeAPI) {
    throw new Error(HOOK_ERROR_MESSAGE);
  }

  return bridgeAPI;
}

function useExternalStore() {
  const { store } = useWebLoginContext();
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsubscribe = store.subscribe(onStoreChange);

      return () => unsubscribe;
    },
    [store],
  );

  const getSnapshot = useCallback(() => {
    return store.getState();
  }, [store]);

  const getServerSnapshot = () => getSnapshot();

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useConnectWallet() {
  const { instance } = useWebLoginContext();
  const stateFromStore = useExternalStore();
  const {
    connect,
    disConnect,
    lock,
    getAccountByChainId,
    getWalletSyncIsCompleted,
    callSendMethod,
    callViewMethod,
    getSignature,
  } = instance;
  const [connecting, setConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    const rs = await connect();
    setConnecting(false);
    return rs;
  }, [connect]);

  const disConnectWallet = useCallback(async () => {
    await disConnect();
  }, [disConnect]);

  return {
    connectWallet,
    disConnectWallet,
    connecting,
    walletInfo: stateFromStore.walletInfo,
    isLocking: stateFromStore.isLocking,
    walletType: stateFromStore.walletType,
    isConnected: !!stateFromStore.walletInfo,
    loginError: stateFromStore.loginError,
    lock,
    getAccountByChainId,
    getWalletSyncIsCompleted,
    callSendMethod,
    callViewMethod,
    getSignature,
  };
}
