import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { SignIn, DIDWalletInfo, SignInInterface } from '@portkey/did-ui-react';

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

export default function Provider({ children }: { children: React.ReactNode }) {
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
        console.log(signinRef.current);
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
        extraElement={<div style={{ background: 'red', width: 100, height: 100 }}>123</div>}
        onFinish={onFinish}
      />
    </WebLoginContext.Provider>
  );
}
