import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { AElfReactProvider } from '@aelf-react/core';
import { WalletHookInterface } from './wallets/types';
import { ExtraWalletNames, WebLoginProviderProps } from './types';
import { usePortkey } from './wallets/portkey/usePortkey';
import NightElfPlugin from './wallets/elf/NightElfPlugin';
import Portkey from './wallets/portkey/Portkey';
import { useElf } from './wallets/elf/useElf';
import { getConfig } from './config';
import { WalletType, WebLoginState } from './constants';

const INITIAL_STATE = {
  loginState: WebLoginState.initial,
  loginError: undefined,
};

export type WebLoginInterface = WalletHookInterface & {
  loginState: WebLoginState;
  loginError: any | unknown;
};
export type WebLoginContextType = WebLoginInterface;

const WebLoginContext = createContext<WebLoginContextType>(INITIAL_STATE as WebLoginContextType);

export const useWebLoginContext = () => useContext(WebLoginContext);
export const useWebLogin: () => WebLoginInterface = () => {
  return useWebLoginContext() as WebLoginInterface;
};

function WebLoginProvider({ connectEagerly, autoShowUnlock, extraWallets, children }: WebLoginProviderProps) {
  const [loginState, setLoginState] = useState(WebLoginState.initial);
  const [loginError, setLoginError] = useState<any | unknown>();
  const [walletType, setWalletType] = useState<WalletType>(WalletType.unknown);

  const [modalOpen, setModalOpen] = useState(false);

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
    isConnectEagerly: connectEagerly,
    loginState,
    setLoginError,
    setLoginState: setLoginStateInternal,
    setWalletType,
  });
  const portkeyApi = usePortkey({
    autoShowUnlock,
    loginState,
    setLoginError,
    setLoginState: setLoginStateInternal,
    setModalOpen,
    setWalletType,
  });

  const login = () => {
    setModalOpen(true);
  };

  const createInvalidFunc = (name: string, loginState: WebLoginState) => () => {
    console.log(`Call method '${name}' on invalid state '${loginState}'`);
  };

  const invalidApi = useMemo<WalletHookInterface>(() => {
    return {
      login: createInvalidFunc('login', loginState),
      loginEagerly: createInvalidFunc('loginEagerly', loginState),
      logout: createInvalidFunc('logout', loginState),
      callContract: createInvalidFunc('callContract', loginState) as any,
    } as WalletHookInterface;
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
      return walletType === WalletType.elf ? elfApi : portkeyApi;
    }
    return invalidApi;
  }, [loginState, invalidApi, elfApi, portkeyApi, walletType]);

  const renderExtraWallets = () => (
    <div className="aelf-web-login aelf-extra-wallets">
      <div className="title">Crypto wallet</div>
      <div className="wallet-entries">
        <NightElfPlugin onClick={elfApi.login} />
      </div>
    </div>
  );

  const state = useMemo(
    () => ({
      loginState,
      loginError,
      ...walletApi,
    }),
    [loginError, loginState, walletApi],
  );

  return (
    <WebLoginContext.Provider value={state}>
      {children}
      <Portkey
        isManagerExists={portkeyApi.isManagerExists}
        open={modalOpen}
        loginState={loginState}
        onCancel={() => setModalOpen(false)}
        onFinish={portkeyApi.onFinished}
        onUnlock={portkeyApi.onUnlock}
        extraWallets={renderExtraWallets()}
      />
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
