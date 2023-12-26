import { WebLoginInstance } from './injectPortkey';
import { WalletHookInterface, WebLoginProviderProps } from './types';
import { WalletType, WebLoginState } from './constants';
import { EventEmitter } from 'events';
import { createContext, useCallback, useState, useMemo, useContext } from 'react';
import { useDebounceFn } from 'ahooks';
import { usePortkey } from './wallets/portkey/usePortkey';
import { getConfig } from './config';
import { AElfReactProvider } from '@aelf-react/core';
import Portkey from './wallets/portkey/Portkey';

const INITIAL_STATE = {
  loginState: WebLoginState.initial,
  loginError: undefined,
  eventEmitter: new EventEmitter(),
};

export type WebLoginInterface = WalletHookInterface & {
  loginId: number;
  loginState: WebLoginState;
  loginError: any | unknown;
  eventEmitter: EventEmitter;
  walletType: WalletType;
};
export type WebLoginInternalInterface = {
  _api: {
    portkey: WalletHookInterface;
  };
};
export type WebLoginContextType = WebLoginInterface & WebLoginInternalInterface;
export const WebLoginContext = createContext<WebLoginContextType>(INITIAL_STATE as WebLoginContextType);

export const useWebLoginContext = () => useContext(WebLoginContext);

export const useWebLogin: () => WebLoginInterface = () => {
  return useWebLoginContext() as WebLoginInterface;
};

function WebLoginProviderV2({ portkey: portkeyOpts, children }: WebLoginProviderProps) {
  const [loginId, setLoginId] = useState(0);
  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const [loginState, setLoginState] = useState(WebLoginState.initial);
  const [loginError, setLoginError] = useState<any | unknown>();
  const [walletType, setWalletType] = useState<WalletType>(WalletType.unknown);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const portkeyInstance = new WebLoginInstance().getPortkey();

  const setLoginStateInternal = useCallback(
    (newLoginState: WebLoginState) => {
      const prevState = loginState;
      setLoginState(newLoginState);
      if (newLoginState === WebLoginState.logined) {
        if (prevState !== newLoginState) {
          setLoginId(loginId + 1);
        }
        setModalOpen(false);
      }
    },
    [loginId, loginState],
  );

  const { run: loginInternal } = useDebounceFn(
    useCallback(async () => {
      if (loginState === WebLoginState.logined) {
        console.warn('login failed: loginState is logined');
        return;
      }
      setLoginStateInternal(WebLoginState.logining);
      setModalOpen(true);
      // portkeyInstance.did.login();
    }, [loginState, portkeyInstance, setLoginStateInternal]),
    {
      wait: 500,
      maxWait: 500,
      leading: true,
    },
  );

  const { run: logoutInternal } = useDebounceFn(
    useCallback(async () => {
      if (loginState !== WebLoginState.logined) {
        console.warn('logout failed: loginState is not logined');
        return;
      }
      portkeyInstance.did.logout();
    }, [loginState, portkeyInstance]),
    {
      wait: 500,
      maxWait: 500,
      leading: true,
    },
  );

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

  const state = useMemo<WebLoginContextType>(() => {
    const a = {
      loginId,
      loginState,
      loginError,
      eventEmitter,
      walletType,
      _api: {
        portkey: portkeyApi,
      },
      ...portkeyApi,
      login: loginInternal,
      logout: logoutInternal,
    };
    console.log(a);
    return a;
  }, [loginId, loginState, loginError, eventEmitter, walletType, portkeyApi, loginInternal, logoutInternal]);

  return (
    <WebLoginContext.Provider value={state}>
      {children}
      <Portkey
        portkeyOpts={portkeyOpts}
        isManagerExists={portkeyApi.isManagerExists}
        open={modalOpen}
        loginState={loginState}
        onCancel={portkeyApi.onCancel}
        onFinish={portkeyApi.onFinished}
        onError={portkeyApi.onError}
        onUnlock={portkeyApi.onUnlock}
      />
      <portkeyInstance.PortkeyLoading loading={loading} />
    </WebLoginContext.Provider>
  );
}

export default function Provider({ children, ...props }: WebLoginProviderProps) {
  return <WebLoginProviderV2 {...props}>{children}</WebLoginProviderV2>;
}
