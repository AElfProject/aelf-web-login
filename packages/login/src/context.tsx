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
import isMobile from './utils/isMobile';
import isPortkeyApp from './utils/isPortkeyApp';
import DiscoverPlugin from './wallets/discover/DiscoverPlugin';
import { useDiscover } from './wallets/discover/useDiscover';
import ConfirmLogoutDialog from './components/CofirmLogoutDialog/ConfirmLogoutDialog';
import { useDebounceFn } from 'ahooks';

const INITIAL_STATE = {
  loginState: WebLoginState.initial,
  loginError: undefined,
  eventEmitter: new EventEmitter(),
};

enum LogoutConfirmResult {
  default,
  cancel,
  ok,
}

export type WebLoginInterface = WalletHookInterface & {
  loginState: WebLoginState;
  loginError: any | unknown;
  eventEmitter: EventEmitter;
  walletType: WalletType;
};

export type WebLoginInternalInterface = {
  _api: {
    nigthElf: WalletHookInterface;
    portkey: WalletHookInterface;
    discover: WalletHookInterface;
  };
};

export type WebLoginContextType = WebLoginInterface & WebLoginInternalInterface;

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
  const [logoutConfirmResult, setLogoutConfirmResult] = useState<LogoutConfirmResult>(LogoutConfirmResult.default);
  const [loading, setLoading] = useState(false);
  const [noLoading, setNoLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bridgeType, setBridgeType] = useState('unknown');

  useEffect(() => {
    // SSR support
    if (typeof window !== 'undefined') {
      check()
        .then((type) => {
          setBridgeType(type);
        })
        .catch((error) => {
          console.warn(error);
        });
    }
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
    walletType,
    eventEmitter,
    setLoginError,
    setLoginState: setLoginStateInternal,
    setWalletType,
    setLoading,
  });
  const discoverApi = useDiscover({
    options: discoverOpts,
    loginState,
    walletType,
    eventEmitter,
    setLoginError,
    setLoginState: setLoginStateInternal,
    setWalletType,
    setLoading,
  });
  const portkeyApi = usePortkey({
    options: portkeyOpts,
    loginState,
    walletType,
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
        discoverApi.login();
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
  }, [discoverApi, elfApi, setLoginStateInternal]);

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

  const { run: loginInternal } = useDebounceFn(
    useCallback(async () => {
      if (loginState === WebLoginState.logined) {
        console.warn('login failed: loginState is logined');
        return;
      }
      walletApi.login();
    }, [loginState, walletApi]),
    {
      wait: 500,
      maxWait: 500,
      leading: true,
    },
  );

  const logout = useCallback(async () => {
    await walletApi.logout();
    try {
      await elfApi.logoutSilently();
    } catch (e) {
      console.warn(e);
    }
    try {
      await discoverApi.logoutSilently();
    } catch (e) {
      console.warn(e);
    }
    try {
      await portkeyApi.logoutSilently();
    } catch (e) {
      console.warn(e);
    }
  }, [discoverApi, elfApi, portkeyApi, walletApi]);

  const { run: logoutInternal } = useDebounceFn(
    useCallback(async () => {
      if (loginState !== WebLoginState.logined) {
        console.warn('logout failed: loginState is not logined');
        return;
      }
      if (walletType === WalletType.portkey) {
        setLogoutConfirmResult(LogoutConfirmResult.default);
        setLogoutConfirmOpen(true);
      } else {
        logout();
      }
    }, [loginState, logout, walletType]),
    {
      wait: 500,
      maxWait: 500,
      leading: true,
    },
  );

  useEffect(() => {
    if (logoutConfirmResult === LogoutConfirmResult.ok) {
      setLogoutConfirmOpen(false);
      setLogoutConfirmResult(LogoutConfirmResult.default);
      logout();
    } else if (logoutConfirmResult === LogoutConfirmResult.cancel) {
      setLogoutConfirmOpen(false);
    }
  }, [logout, logoutConfirmResult, walletApi]);

  const state = useMemo<WebLoginContextType>(
    () => ({
      loginState,
      loginError,
      eventEmitter,
      walletType,
      _api: {
        nigthElf: elfApi,
        portkey: portkeyApi,
        discover: discoverApi,
      },
      ...walletApi,
      login: loginInternal,
      logout: logoutInternal,
    }),
    [
      discoverApi,
      elfApi,
      eventEmitter,
      loginError,
      loginInternal,
      loginState,
      logoutInternal,
      portkeyApi,
      walletApi,
      walletType,
    ],
  );

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
                return <NightElfPlugin key={wallet} nightEflOpts={nightEflOpts} onClick={elfApi.login} />;
              } else if (wallet === WalletType.discover) {
                return (
                  <DiscoverPlugin
                    key={wallet}
                    discoverOpts={discoverOpts}
                    detectState={discoverApi.discoverDetected}
                    onClick={discoverApi.login}
                  />
                );
              }
            })}
        </div>
      </div>
    );
  };

  return (
    <WebLoginContext.Provider value={state}>
      {children}
      <ConfirmLogoutDialog
        visible={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmResult(LogoutConfirmResult.cancel)}
        onOk={() => setLogoutConfirmResult(LogoutConfirmResult.ok)}
      />
      <Portkey
        portkeyOpts={portkeyOpts}
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
