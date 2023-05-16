import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AElfReactProvider } from '@aelf-react/core';
import PortkeyPlugin from './wallets/PortkeyPlugin';
import ElfPlugin from './wallets/NightElfPlugin';
import { PORTKEY, ELF } from './constants';
import { getConfig } from './config';
import { WalletInterface, WebLoginCallback, WebLoginContextType, WebLoginHook } from './types';
import { Portkey } from './wallets/Portkey';

const INITIAL_STATE = {
  setModalOpen: () => {},
  openWebLogin: () => {},
};

const WebLoginContext = createContext<WebLoginContextType>(INITIAL_STATE);

export const useWebLogin: WebLoginHook = () => {
  const context = useContext(WebLoginContext);
  return useCallback(() => {
    return new Promise<WalletInterface>(resolve => {
      context.openWebLogin(true, wallet => {
        resolve(wallet);
      });
    });
  }, [context]);
};

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

export default function Provider({
  extraWallets,
  children,
}: {
  extraWallets: ExtraWallets;
  children: React.ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const onCompleteFunc = useRef<WebLoginCallback>(() => {});

  const state = useMemo(
    () => ({
      setModalOpen,
      openWebLogin: (callback: WebLoginCallback) => {
        console.log('openWebLogin:', callback);
        onCompleteFunc.current = callback;
        setModalOpen(true);
      },
    }),
    [],
  );

  const onLogin = (error?: Error, wallet?: WalletInterface) => {
    if (error) {
      console.error(error);
    } else {
      console.log(wallet);
      onCompleteFunc.current(wallet);
    }
  };

  console.log(state);
  var aelfReactConfig = getConfig().aelfReact;

  return (
    <AElfReactProvider appName={aelfReactConfig.appName} nodes={aelfReactConfig.nodes}>
      <WebLoginContext.Provider value={state}>
        {children}
        <Portkey
          open={modalOpen}
          onLogin={onLogin}
          extraWallets={<ExtraWallets extraWallets={extraWallets} onLogin={onLogin} />}
        />
      </WebLoginContext.Provider>
    </AElfReactProvider>
  );
}
