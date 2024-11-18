/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ConnectedWallet,
  enhancedLocalStorage,
  PORTKEYAA,
} from '@aelf-web-login/wallet-adapter-base';
import { IBridgeAPI, IConfigProps, initBridge } from '@aelf-web-login/wallet-adapter-bridge';
import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

const HOOK_ERROR_MESSAGE =
  'Must call the provided initialization method`init` method before using hooks.';
// let noCommonBaseModal = false;
export const init = (options: IConfigProps): IBridgeAPI => {
  // noCommonBaseModal = options.baseConfig.noCommonBaseModal ?? false;
  if (options.baseConfig.showVconsole && typeof window !== 'undefined') {
    import('vconsole')
      .then((VConsole) => new VConsole.default())
      .catch((err) => console.log('Error loading VConsole:', err));
  }
  console.log('aelf-web-login-init..............31');
  function initScriptAndMountApp() {
    if (options.baseConfig.omitTelegramScript) {
      return;
    }
    // const HOSTNAME_PREFIX_LIST = ['tg.', 'tg-test.', 'localhost'];
    const TELEGRAM_SRC = 'https://telegram.org/js/telegram-web-app.js';
    if (typeof window !== 'undefined' && typeof location !== 'undefined') {
      // if (HOSTNAME_PREFIX_LIST.some(h => location.hostname.includes(h))) {
      const script = document.createElement('script');
      script.src = TELEGRAM_SRC;
      script.async = false;
      document.head.appendChild(script);
      console.log('initScriptAndMountApp');
      // }
    }
  }

  initScriptAndMountApp();
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
  // const { mountApp, unMountApp, getSignIn } = bridgeAPI ?? {
  //   mountApp: () => {},
  //   unMountApp: () => {},
  //   getSignIn: () => null,
  // };
  // useEffect(() => {
  //   if (noCommonBaseModal) {
  //     return;
  //   }
  //   mountApp();
  //   return unMountApp;
  // }, [mountApp, unMountApp]);
  const { getSignIn } = bridgeAPI ?? {
    getSignIn: () => null,
  };

  if (!bridgeAPI) {
    return null;
  }
  return (
    <WebLoginContext.Provider value={bridgeAPI}>
      {/* {noCommonBaseModal ? getSignIn(children) : children} */}
      {getSignIn(children)}
    </WebLoginContext.Provider>
  );
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
    sendMultiTransaction,
    getSignature,
    clearManagerReadonlyStatus,
    checkLoginStatus,
  } = instance;
  const [connecting, setConnecting] = useState(false);

  const isConnected = useMemo(() => {
    if (enhancedLocalStorage.getItem(ConnectedWallet) === PORTKEYAA) {
      return !!stateFromStore.walletInfo;
    } else {
      return !!enhancedLocalStorage.getItem(ConnectedWallet) || !!stateFromStore.walletInfo;
    }
  }, [stateFromStore.walletInfo]);

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
    walletInfo: stateFromStore.walletInfo,
    isLocking: stateFromStore.isLocking,
    walletType: stateFromStore.walletType,
    isConnected: isConnected,
    loginError: stateFromStore.loginError,
    loginOnChainStatus: stateFromStore.loginOnChainStatus,
    approvedGuardians: stateFromStore.approvedGuardians,
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
