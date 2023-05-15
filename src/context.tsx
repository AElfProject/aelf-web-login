import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { SignIn, DIDWalletInfo, SignInInterface } from '@portkey/did-ui-react';
import PortkeyPlugin from './wallets/PortkeyPlugin';
import ElfPlugin from './wallets/ElfPlugin';
import { PORTKEY, ELF } from './constants';

const INITIAL_STATE = {
  openWebLogin: () => {
    console.log('openWebLogin');
  },
};

export type WebLoginCallback = (didWallet: DIDWalletInfo) => void;
export type WebLoginContextType = {
  openWebLogin: (callback: WebLoginCallback) => void;
};

const WebLoginContext = createContext<WebLoginContextType>(INITIAL_STATE);

export const useWebLogin = () => {
  const context = useContext(WebLoginContext);
  return useCallback(() => {
    return new Promise<DIDWalletInfo>(resolve => {
      context.openWebLogin(true, didWallet => {
        resolve(didWallet);
      });
    });
  }, [context]);
};

function ExtraWallets({ extraWallets }: { extraWallets: ExtraWallets }) {
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
          return <Plugin />;
        })}
      </div>
    </div>
  );
}

export type ExtraWalletNames = 'portkey' | 'elf';
export type ExtraWallets = Array<ExtraWalletNames>;

export default function Provider({
  extraWallets,
  children,
}: {
  extraWallets: ExtraWallets;
  children: React.ReactNode;
}) {
  const signinRef = useRef<SignInInterface>();
  const onCompleteFunc = useRef<WebLoginCallback>(() => {});

  const onFinish = useCallback((didWallet: DIDWalletInfo) => {
    console.log('didWallet:', didWallet);
    onCompleteFunc.current(didWallet);
  }, []);

  const state = useMemo(
    () => ({
      openWebLogin: (callback: WebLoginCallback) => {
        console.log('openWebLogin:', callback);
        signinRef.current?.setOpen(true);
        onCompleteFunc.current = callback;
      },
    }),
    [],
  );

  console.log(state);

  return (
    <WebLoginContext.Provider value={state}>
      {children}
      <SignIn
        ref={signinRef}
        uiType="Modal"
        isShowScan
        extraElement={extraWallets && <ExtraWallets extraWallets={extraWallets} />}
        onFinish={onFinish}
      />
    </WebLoginContext.Provider>
  );
}
