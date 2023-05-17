import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AElfReactProvider, useAElfReact } from '@aelf-react/core';
import PortkeyPlugin from './wallets/PortkeyPlugin';
import ElfPlugin from './wallets/NightElfPlugin';
import { PORTKEY, ELF } from './constants';
import { getConfig } from './config';
import { WalletInterface, WebLoginCallback, WebLoginContextType, WebLoginHook } from './types';
import { Portkey } from './wallets/Portkey';
import { useCheckWallet } from './wallet';

const INITIAL_STATE = {
  wallet: undefined,
};

const WebLoginContext = createContext<WebLoginContextType>(INITIAL_STATE as WebLoginContextType);

export const useWebLoginContext = () => useContext(WebLoginContext);
export const useWebLogin: WebLoginHook = () => useWebLoginContext();
export const useWallet = () => useWebLoginContext().wallet;

export type ExtraWalletNames = 'portkey' | 'elf';
export type ExtraWallets = Array<ExtraWalletNames>;

function ExtraWallets({ extraWallets, onLogin }: { extraWallets: ExtraWallets; onLogin: WebLoginCallback }) {
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
          return <Plugin key={walletName} onLogin={onLogin} />;
        })}
      </div>
    </div>
  );
}

export type WebLoginProviderProps = {
  extraWallets: ExtraWallets;
  children: React.ReactNode;
};

function WebLoginProvider({ extraWallets, children }: WebLoginProviderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const walletRef = useRef<WalletInterface>();
  const onCompleteFunc = useRef<WebLoginCallback>();
  const checkWallet = useCheckWallet();
  const { isActive, deactivate } = useAElfReact();

  const setWallet = (wallet?: WalletInterface) => {
    walletRef.current = wallet;
  };

  const openWebLogin = useCallback(() => {
    return new Promise<WalletInterface>((resolve) => {
      onCompleteFunc.current = async (error?: unknown, wallet?: WalletInterface) => {
        if (error) {
          // TODO: handle error
          return;
        }
        await wallet!.initialize();
        setModalOpen(false);
        resolve(wallet!);
      };
      setModalOpen(true);
    });
  }, [setModalOpen]);

  const checkWebLogin = useCallback(checkWallet, [checkWallet]);

  const login = useCallback(async () => {
    let currentWallet = await checkWallet();
    if (!currentWallet) {
      currentWallet = await openWebLogin();
    }
    await currentWallet?.initialize();
    return currentWallet;
  }, [checkWallet, openWebLogin]);

  const logout = useCallback(async () => {
    console.log('logout');
    const currentWallet = await checkWallet();
    await currentWallet?.logout();
    // TODO: fix
    localStorage.clear();
    if (isActive) {
      await deactivate();
    }
  }, [isActive, deactivate, checkWallet]);

  const state = useMemo(
    () => ({
      setWallet,
      setModalOpen,
      login,
      logout,
      openWebLogin,
      checkWebLogin,
    }),
    [setModalOpen, login, logout, openWebLogin, checkWebLogin],
  );

  const onLogin = (error?: Error, wallet?: WalletInterface) => {
    if (error) {
      console.error(error);
    } else {
      console.log(wallet);
      onCompleteFunc.current?.(wallet);
    }
  };

  return (
    <WebLoginContext.Provider value={state}>
      {children}
      <Portkey
        open={modalOpen}
        onLogin={onLogin}
        extraWallets={<ExtraWallets extraWallets={extraWallets} onLogin={onLogin} />}
      />
    </WebLoginContext.Provider>
  );
}

export default function Provider({ extraWallets, children }: WebLoginProviderProps) {
  const aelfReactConfig = getConfig().aelfReact;
  return (
    <AElfReactProvider appName={aelfReactConfig.appName} nodes={aelfReactConfig.nodes}>
      <WebLoginProvider extraWallets={extraWallets}>{children}</WebLoginProvider>
    </AElfReactProvider>
  );
}
