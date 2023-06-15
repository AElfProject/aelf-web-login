import { EventEmitter } from 'events';
import React, { createContext, useEffect, useContext, useCallback, useMemo, useState } from 'react';
import { AElfReactProvider } from '@aelf-react/core';
import { WalletHookInterface } from './types';
import { WebLoginProviderProps } from './types';
import { usePortkey } from './wallets/portkey/usePortkey';
import NightElfPlugin from './wallets/elf/NightElfPlugin';
import Portkey from './wallets/portkey/Portkey';
import { useElf } from './wallets/elf/useElf';
import { getConfig } from './config';
import { WalletType, WebLoginState } from './constants';
import { PortkeyLoading } from '@portkey/did-ui-react';
import { check } from './wallets/elf/utils';
import isMobile, { isPortkeyApp } from './utils/isMobile';
import DiscoverPlugin from './wallets/discover/DiscoverPlugin';
import { useDiscover } from './wallets/discover/useDiscover';

const INITIAL_STATE = {
  loginState: WebLoginState.initial,
  loginError: undefined,
  eventEmitter: new EventEmitter(),
};

export type WebLoginInterface = WalletHookInterface & {
  loginState: WebLoginState;
  loginError: any | unknown;
  eventEmitter: EventEmitter;
};
export type WebLoginContextType = WebLoginInterface;

export const WebLoginContext = createContext<WebLoginContextType>(INITIAL_STATE as WebLoginContextType);

export const useWebLoginContext = () => useContext(WebLoginContext);
export const useWebLogin: () => WebLoginInterface = () => {
  return useWebLoginContext() as WebLoginInterface;
};

function WebLoginProvider({
  nightElf: nightEflOpts,
  portkey: portkeyOpts,
  discover: discoverOpts,
  extraWallets,
  children,
}: WebLoginProviderProps) {
  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const [loginState, setLoginState] = useState(WebLoginState.initial);
  const [loginError, setLoginError] = useState<any | unknown>();
  const [walletType, setWalletType] = useState<WalletType>(WalletType.unknown);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noLoading, setNoLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bridgeType, setBridgeType] = useState('unknown');

  useEffect(() => {
    check()
      .then((type) => {
        setBridgeType(type);
      })
      .catch((error) => {
        console.warn(error);
      });
  }, []);

  const setLoginStateInternal = useCallback(
    (loginState: WebLoginState) => {
      setLoginState(loginState);
      if (loginState === WebLoginState.logined) {
        setModalOpen(false);
      }
    },
    [setLoginState, setModalOpen],
  );

  const elfApi = useElf({
    options: nightEflOpts,
    loginState,
    eventEmitter,
    setLoginError,
    setLoginState: setLoginStateInternal,
    setWalletType,
    setLoading,
  });
  const discoverApi = useDiscover({
    options: discoverOpts,
    loginState,
    eventEmitter,
    setLoginError,
    setLoginState: setLoginStateInternal,
    setWalletType,
    setLoading,
  });
  const portkeyApi = usePortkey({
    options: portkeyOpts,
    loginState,
    eventEmitter,
    setLoginError,
    setLoginState: setLoginStateInternal,
    setModalOpen,
    setWalletType,
    setLoading,
  });

  const login = useCallback(async () => {
    setLoginStateInternal(WebLoginState.logining);
    try {
      if (isPortkeyApp()) {
        setNoLoading(false);
        portkeyApi.login();
        return;
      } else {
        const type = await check();
        if (type === 'AelfBridge') {
          setNoLoading(false);
          elfApi.login();
          return;
        }
      }
    } catch (error) {
      console.warn(error);
    }
    setModalOpen(true);
  }, [elfApi, portkeyApi, setLoginStateInternal]);

  const createInvalidFunc = (name: string, loginState: WebLoginState) => () => {
    console.log(`Call method '${name}' on invalid state '${loginState}'`);
  };

  const invalidApi = useMemo<WalletHookInterface>(() => {
    return {
      wallet: { address: '', accountInfoSync: { syncCompleted: false, holderInfo: undefined } },
      login: createInvalidFunc('login', loginState),
      loginEagerly: createInvalidFunc('loginEagerly', loginState),
      logout: createInvalidFunc('logout', loginState),
      callContract: createInvalidFunc('callContract', loginState) as any,
    } as unknown as WalletHookInterface;
  }, [loginState]);

  // adapt api
  const walletApi = useMemo<WalletHookInterface>(() => {
    if (loginState === WebLoginState.initial) {
      return {
        ...invalidApi,
        login,
      };
    }
    if (loginState === WebLoginState.eagerly) {
      return { ...invalidApi, loginEagerly: elfApi.loginEagerly };
    }
    if (loginState === WebLoginState.lock) {
      return { ...invalidApi, login: portkeyApi.login, loginEagerly: portkeyApi.loginEagerly };
    }
    if (loginState === WebLoginState.logining) {
      return { ...invalidApi };
    }
    if (loginState === WebLoginState.logined) {
      if (walletType === WalletType.elf) {
        return elfApi;
      } else if (walletType === WalletType.portkey) {
        return portkeyApi;
      } else if (walletType === WalletType.discover) {
        return discoverApi;
      }
      return invalidApi;
    }
    return invalidApi;
  }, [loginState, invalidApi, login, elfApi, portkeyApi, walletType, discoverApi]);

  const renderExtraWallets = () => {
    const isMobileDevice = isMobile();
    const isBridgeNotExist = bridgeType === 'unknown' || (bridgeType === 'none' && isMobileDevice);
    const isDiscoverMobileNotExist =
      discoverApi.discoverDetected === 'unknown' || (discoverApi.discoverDetected === 'not-detected' && isMobileDevice);
    // hide extra wallets when bridge and discover mobile not exist
    if (isBridgeNotExist && isDiscoverMobileNotExist) {
      return;
    }
    return (
      <div className="aelf-web-login aelf-extra-wallets">
        <div className="title">Crypto wallet</div>
        <div className="wallet-entries">
          {extraWallets
            // hide specific wallet when bridge or discover mobile not exist
            ?.filter((wallet) => {
              if (wallet === WalletType.elf) {
                return !isBridgeNotExist;
              } else if (wallet === WalletType.discover) {
                return !isDiscoverMobileNotExist;
              }
              return true;
            })
            .map((wallet) => {
              if (wallet === WalletType.elf) {
                return <NightElfPlugin key={wallet} onClick={elfApi.login} />;
              } else if (wallet === WalletType.discover) {
                return (
                  <DiscoverPlugin key={wallet} detectState={discoverApi.discoverDetected} onClick={discoverApi.login} />
                );
              }
            })}
        </div>
      </div>
    );
  };

  const logoutInternal = useCallback(async () => {
    setLogoutConfirmOpen(true);
    // TODO: show confirm modal and wait use to confirm
    setLogoutConfirmOpen(false);
    // TODO: check if use cancelled
    await walletApi.logout();
  }, [walletApi]);

  const state = useMemo(
    () => ({
      loginState,
      loginError,
      eventEmitter,
      ...walletApi,
      logout: logoutInternal,
    }),
    [eventEmitter, loginError, loginState, logoutInternal, walletApi],
  );

  return (
    <WebLoginContext.Provider value={state}>
      {children}
      <Portkey
        isManagerExists={portkeyApi.isManagerExists}
        open={modalOpen}
        loginState={loginState}
        onCancel={portkeyApi.onCancel}
        onFinish={portkeyApi.onFinished}
        onUnlock={portkeyApi.onUnlock}
        onError={portkeyApi.onError}
        extraWallets={renderExtraWallets()}
      />
      <PortkeyLoading loading={!noLoading && loading} />
    </WebLoginContext.Provider>
  );
}

export default function Provider({ children, ...props }: WebLoginProviderProps) {
  const aelfReactConfig = getConfig().aelfReact;
  return (
    <AElfReactProvider appName={aelfReactConfig.appName} nodes={aelfReactConfig.nodes}>
      <WebLoginProvider {...props}>{children}</WebLoginProvider>
    </AElfReactProvider>
  );
}
