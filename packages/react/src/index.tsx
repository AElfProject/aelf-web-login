import React, { useCallback, useState, useSyncExternalStore } from 'react';
import { initBridge, IConfigProps, IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';

const HOOK_ERROR_MESSAGE =
  'Must call the provided initialization method`init` method before using hooks.';

export const init = (options: IConfigProps): IBridgeAPI => {
  const dataFromBridge = initBridge(options);
  return dataFromBridge;
};

export const Context: React.Context<IBridgeAPI | undefined> = React.createContext<
  IBridgeAPI | undefined
>(undefined);

export type WebLoginProviderProps = {
  bridgeAPI: IBridgeAPI;
};

export function WebLoginProvider({
  children,
  bridgeAPI,
}: React.PropsWithChildren<WebLoginProviderProps>) {
  return <Context.Provider value={bridgeAPI}>{children}</Context.Provider>;
}

export function useWebLoginContext(): IBridgeAPI {
  const bridgeAPI = React.useContext(Context);

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
  const { connect, disConnect, loginState, lock, getAccountByChainId } = instance;
  const [connecting, setConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    await connect();
    setConnecting(false);
  }, [connect]);

  const disConnectWallet = useCallback(async () => {
    await disConnect();
  }, [disConnect]);

  return {
    connectWallet,
    disConnectWallet,
    connecting,
    stateFromStore,
    loginState,
    lock,
    getAccountByChainId,
  };
}
