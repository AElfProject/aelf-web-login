import React, { createContext, useCallback, useContext, useMemo, useEffect, useState } from 'react';
import { AElfReactProvider, useAElfReact } from '@aelf-react/core';
import PortkeyPlugin from './wallets/PortkeyPlugin';
import ElfPlugin from './wallets/NightElfPlugin';
import { PORTKEY, ELF } from './constants';
import { getConfig } from './config';
import {
  ExtraWalletNames,
  WalletInterface,
  WebLoginContextType,
  WebLoginHook,
  WebLoginProviderProps,
  WebLoginState,
} from './types';
import { Portkey } from './wallets/Portkey';
import { AbstractWallet, ElfWallet, PortkeyWallet } from './wallet';

const INITIAL_STATE = {
  wallet: undefined,
};

const WebLoginContext = createContext<WebLoginContextType>(INITIAL_STATE as WebLoginContextType);

export const useWebLoginContext = () => useContext(WebLoginContext);
export const useWebLogin: WebLoginHook = () => useWebLoginContext();
export const useWallet = () => {
  const wallet = useWebLoginContext().wallet;
  return wallet;
};

function ExtraWallets({ extraWallets }: { extraWallets: Array<ExtraWalletNames> }) {
  const plugins = {
    [PORTKEY]: PortkeyPlugin,
    [ELF]: ElfPlugin,
  };
  return (
    <div className="aelf-web-login aelf-extra-wallets">
      <div className="title">Crypto wallet</div>
      <div className="wallet-entries">
        {extraWallets.map((walletName: ExtraWalletNames) => {
          const Plugin = plugins[walletName];
          return <Plugin key={walletName} />;
        })}
      </div>
    </div>
  );
}

function WebLoginProvider({ connectEagerly, autoShowUnlock, extraWallets, children }: WebLoginProviderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loginState, setLoginState] = useState(WebLoginState.initial);
  const [loginError, setLoginError] = useState<any | unknown>();
  const [walletInstance, setWalletInstance] = useState<WalletInterface>();

  const appName = getConfig().appName;

  const { isActive, deactivate } = useAElfReact();

  const setWallet = useCallback(async (wallet?: WalletInterface) => {
    if (wallet) {
      const absWallet = wallet as AbstractWallet<any>;
      await absWallet.initialize();
      setWalletInstance(absWallet);
    } else {
      setWallet(undefined);
    }
  }, []);

  const loginEagerly = useCallback(() => {
    // TODO:
  }, []);

  const login = useCallback(async () => {
    setModalOpen(true);
  }, []);

  const logout = useCallback(async () => {
    // TODO:
  }, []);

  const state = useMemo(
    () => ({
      wallet: walletInstance,
      loginState,
      loginError,
      setLoginError,
      setLoginState,
      setWallet,
      setModalOpen,
      loginEagerly,
      login,
      logout,
    }),
    [walletInstance, loginState, loginError, setWallet, loginEagerly, login, logout],
  );

  useEffect(() => {
    if (PortkeyWallet.checkLocalManager(appName)) {
      if (autoShowUnlock) {
        login();
      }
      return;
    }
    if (ElfWallet.checkConnectEagerly()) {
      if (connectEagerly) {
        loginEagerly();
      }
    }
  }, []);

  return (
    <WebLoginContext.Provider value={state}>
      {children}
      <Portkey open={modalOpen} extraWallets={<ExtraWallets extraWallets={extraWallets} />} />
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
