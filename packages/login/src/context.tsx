import { EventEmitter } from 'events';
import React, { createContext, useEffect, useContext, useCallback, useMemo, useState } from 'react';
import { AElfReactProvider } from '@aelf-react/core';
import { ExtraWalletNames, WalletHookInterface } from './types';
import { WebLoginProviderProps } from './types';
import { usePortkey } from './wallets/portkey/usePortkey';
import { usePortkey as usePortkeyV1 } from './wallets/portkey/usePortkey/indexV1';
import Portkey from './wallets/portkey/Portkey';
import PortkeyV1 from './wallets/portkey/Portkey/indexV1';
import { useElf } from './wallets/elf/useElf';
import { getConfig, event$ } from './config';
import { WalletType, WebLoginState, WebLoginEvents } from './constants';
import { CommonBaseModal, PortkeyLoading } from '@portkey/did-ui-react';
import { check } from './wallets/elf/utils';
import isMobile from './utils/isMobile';
import isPortkeyApp from './utils/isPortkeyApp';
import {
  LOGIN_EARGLY_KEY as DISCOVER_LOGIN_EARGERLY_KEY,
  LOGIN_EARGLY_KEY,
  useDiscover,
} from './wallets/discover/useDiscover';
import ConfirmLogoutDialog from './components/CofirmLogoutDialog/ConfirmLogoutDialog';
import { useDebounceFn } from 'ahooks';
import ExtraWallets from './wallets/extraWallets';
import clsx from 'clsx';
import { PortkeyDid, PortkeyDidV1 } from './index';
import { getStorageVersion } from './utils/getUrl';

const INITIAL_STATE = {
  loginState: WebLoginState.initial,
  loginError: undefined,
  eventEmitter: new EventEmitter(),
  version: localStorage.getItem(DISCOVER_LOGIN_EARGERLY_KEY) ? 'v1' : 'v2',
};

export enum LogoutConfirmResult {
  default,
  cancel,
  ok,
}

export type WebLoginInterface = WalletHookInterface & {
  loginId: number;
  loginState: WebLoginState;
  loginError: any | unknown;
  eventEmitter: EventEmitter;
  walletType: WalletType;
  version: string;
};

export type WebLoginInternalInterface = {
  _api: {
    nigthElf: WalletHookInterface;
    portkey: WalletHookInterface;
    discover: WalletHookInterface;
  };
  _multiWallets: {
    current: WalletType;
    switchingWallet: WalletType;
    switching: boolean;
    setSwitingWallet: (walletType: WalletType) => void;
  };
};

export type WebLoginContextType = WebLoginInterface & WebLoginInternalInterface;

export const WebLoginContext = createContext<WebLoginContextType>(INITIAL_STATE as WebLoginContextType);

export const useWebLoginContext = () => useContext(WebLoginContext);
export const useWebLogin: () => WebLoginInterface = () => {
  return useWebLoginContext() as WebLoginInterface;
};

export type ExtraWalletProviderProps = Omit<WebLoginProviderProps, 'children'>;
export const ExtraWalletContext = createContext<ExtraWalletProviderProps>({} as ExtraWalletProviderProps);

export const PortkeyProvider = ({ children, ...props }: any) => {
  return (
    <PortkeyDid.PortkeyProvider {...props} networkType={props.networkTypeV2}>
      <PortkeyDidV1.PortkeyProvider {...props}>{children}</PortkeyDidV1.PortkeyProvider>
    </PortkeyDid.PortkeyProvider>
  );
};

export const PortkeyAssetProvider = ({ children, ...props }: any) => {
  return (
    <PortkeyDid.PortkeyAssetProvider {...props}>
      <PortkeyDidV1.PortkeyAssetProvider {...props}>{children}</PortkeyDidV1.PortkeyAssetProvider>
    </PortkeyDid.PortkeyAssetProvider>
  );
};

export function removeOtherKey(type: WalletType) {
  if (type === 'unknown') return;
  const map = {
    discover: [LOGIN_EARGLY_KEY],
    elf: ['aelf-connect-eagerly'],
  };
  (Object.keys(map) as Array<keyof typeof map>).forEach((key) => {
    if (type !== key) {
      const keyArr: string[] = map[key];
      keyArr.forEach((item) => {
        localStorage.removeItem(item);
      });
    }
  });
}

function WebLoginProvider({
  nightElf: nightElfOpts,
  portkey: portkeyOpts,
  discover: discoverOpts,
  extraWallets,
  children,
  commonConfig,
}: WebLoginProviderProps) {
  const WEB_LOGIN_VERSION = getStorageVersion();
  const eventEmitter = useMemo(() => INITIAL_STATE.eventEmitter, []);
  const [loginState, setLoginState] = useState(WebLoginState.initial);
  const [loginError, setLoginError] = useState<any | unknown>();
  const [walletType, setWalletType] = useState<WalletType>(WalletType.unknown);
  const [switchingWalletType, setSwitchingWalletType] = useState<WalletType>(WalletType.unknown);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutConfirmResult, setLogoutConfirmResult] = useState<LogoutConfirmResult>(LogoutConfirmResult.default);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bridgeType, setBridgeType] = useState('unknown');
  const [loginId, setLoginId] = useState(0);

  //  old users who have already logged into v1 will be automatically logged in
  const initVersion = useMemo(() => {
    if (localStorage.getItem(DISCOVER_LOGIN_EARGERLY_KEY)) {
      return localStorage.getItem(WEB_LOGIN_VERSION) || 'v1';
    } else {
      return localStorage.getItem(WEB_LOGIN_VERSION) || 'v2';
    }
  }, []);

  const [version, setVersion] = useState<string>(initVersion);
  const [changeVerBtnClicked, setChangeVerBtnClicked] = useState<{ version: string }>();

  event$.useSubscription(async (value: any) => {
    // setModalOpen(false);
    setChangeVerBtnClicked(value as { version: string });
    setLoginState(WebLoginState.initial);
    value.version && setVersion(value.version);
  });

  useEffect(() => {
    // design default
    portkeyOpts.design = portkeyOpts.design || 'CryptoDesign';
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

  useEffect(() => {
    localStorage.setItem(WEB_LOGIN_VERSION, version === 'v1' ? 'v1' : 'v2');
    if (changeVerBtnClicked) {
      eventEmitter.emit(WebLoginEvents.CHANGE_PORTKEY_VERSION, changeVerBtnClicked?.version);
    }
  }, [changeVerBtnClicked?.version, eventEmitter, version]);

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

  const elfApi = useElf({
    options: nightElfOpts,
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
  // change config according to version of portkey
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

  const portkeyApiV1 = usePortkeyV1({
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
        discoverApi.login();
        return;
      } else {
        const type = await check();
        if (type === 'AelfBridge') {
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
      const isDiscoverEagerly = !!localStorage.getItem(DISCOVER_LOGIN_EARGERLY_KEY);
      return { ...invalidApi, loginEagerly: isDiscoverEagerly ? discoverApi.loginEagerly : elfApi.loginEagerly };
    }
    if (loginState === WebLoginState.lock) {
      return {
        ...invalidApi,
        login: (version === 'v1' ? portkeyApiV1 : portkeyApi).login,
        loginEagerly: (version === 'v1' ? portkeyApiV1 : portkeyApi).loginEagerly,
      };
    }
    if (loginState === WebLoginState.logining) {
      if (switchingWalletType !== WalletType.unknown) {
        if (walletType === WalletType.elf) {
          return elfApi;
        } else if (walletType === WalletType.portkey) {
          return version === 'v1' ? portkeyApiV1 : portkeyApi;
        } else if (walletType === WalletType.discover) {
          return discoverApi;
        }
      }
      return { ...invalidApi };
    }
    if (loginState === WebLoginState.logined) {
      if (walletType === WalletType.elf) {
        return elfApi;
      } else if (walletType === WalletType.portkey) {
        return version === 'v1' ? portkeyApiV1 : portkeyApi;
      } else if (walletType === WalletType.discover) {
        return discoverApi;
      }
      return invalidApi;
    }
    return invalidApi;
  }, [
    loginState,
    invalidApi,
    login,
    discoverApi,
    elfApi,
    version,
    portkeyApiV1,
    portkeyApi,
    switchingWalletType,
    walletType,
  ]);

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
      await discoverApi.logoutSilently();
    } catch (e) {
      console.warn(e);
    }
    try {
      await elfApi.logoutSilently();
    } catch (e) {
      console.warn(e);
    }
    try {
      await (version === 'v1' ? portkeyApiV1 : portkeyApi).logoutSilently();
    } catch (e) {
      console.warn(e);
    }
  }, [walletApi, discoverApi, elfApi, version, portkeyApiV1, portkeyApi]);

  const { run: logoutInternal } = useDebounceFn(
    useCallback(
      async (options) => {
        if (loginState !== WebLoginState.logined) {
          console.warn('logout failed: loginState is not logined');
          return;
        }
        if (walletType === WalletType.portkey && !options?.noModal) {
          setLogoutConfirmResult(LogoutConfirmResult.default);
          setLogoutConfirmOpen(true);
        } else {
          await logout();
        }
      },
      [loginState, logout, walletType],
    ),
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

  const ConfirmLogoutDialogComponent = portkeyOpts.ConfirmLogoutDialog || ConfirmLogoutDialog;

  const state = useMemo<WebLoginContextType>(
    () => ({
      loginId,
      loginState,
      loginError,
      eventEmitter,
      walletType,
      _api: {
        nigthElf: elfApi,
        portkey: version === 'v1' ? portkeyApiV1 : portkeyApi,
        discover: discoverApi,
      },
      _multiWallets: {
        current: walletType,
        switchingWallet: switchingWalletType,
        switching: switchingWalletType !== WalletType.unknown,
        setSwitingWallet: setSwitchingWalletType,
      },
      ...walletApi,
      login: loginInternal,
      logout: logoutInternal,
      version,
    }),
    [
      loginId,
      loginState,
      loginError,
      eventEmitter,
      walletType,
      elfApi,
      portkeyApi,
      portkeyApiV1,
      discoverApi,
      switchingWalletType,
      walletApi,
      loginInternal,
      logoutInternal,
      version,
    ],
  );

  const renderExtraWallets = () => {
    const isMobileDevice = isMobile();
    const isBridgeNotExist = bridgeType === 'unknown' || (bridgeType === 'none' && isMobileDevice);
    const isDiscoverMobileNotExist =
      discoverApi.discoverDetected === 'unknown' || (discoverApi.discoverDetected === 'not-detected' && isMobileDevice);

    const isShowDiscoverButton = isMobile() && !isPortkeyApp();

    let headerClassName = 'default-header';
    let contentClassName = 'default-content';

    if (portkeyOpts.design === 'Web2Design') {
      headerClassName = 'web2-header';
      contentClassName = 'web2-content';
    } else if (portkeyOpts.design === 'SocialDesign') {
      headerClassName = 'social-header';
      contentClassName = 'social-content';
    } else if (portkeyOpts.design === 'CryptoDesign') {
      headerClassName = 'crypto-header';
      contentClassName = 'crypto-content';
    }

    // hide extra wallets when bridge and discover mobile not exist
    if (isBridgeNotExist && isDiscoverMobileNotExist && !isShowDiscoverButton) {
      return;
    }
    return (
      <ExtraWalletContext.Provider
        value={{
          nightElf: nightElfOpts,
          portkey: portkeyOpts,
          discover: discoverOpts,
          extraWallets,
          commonConfig,
        }}>
        <ExtraWallets
          headerClassName={headerClassName}
          contentClassName={contentClassName}
          version={version}
          portkeyApi={version === 'v1' ? portkeyApiV1 : portkeyApi}
          elfApi={elfApi}
          discoverApi={discoverApi}
          isBridgeNotExist={isBridgeNotExist}></ExtraWallets>
      </ExtraWalletContext.Provider>
    );
  };

  const isManagerExists = useMemo(
    () => (version === 'v1' ? portkeyApiV1.isManagerExists : portkeyApi.isManagerExists),
    [portkeyApi.isManagerExists, portkeyApiV1.isManagerExists, version],
  );

  const isShowUnlockPage = useMemo(
    () => isManagerExists && (loginState === WebLoginState.logining || loginState === WebLoginState.lock),
    [isManagerExists, loginState],
  );

  const PortkeySDKEle = useMemo(
    () =>
      version === 'v1' ? (
        <PortkeyV1
          portkeyOpts={portkeyOpts}
          isManagerExists={portkeyApiV1.isManagerExists}
          open={modalOpen}
          loginState={loginState}
          onCancel={portkeyApiV1.onCancel}
          onFinish={portkeyApiV1.onFinished}
          onUnlock={portkeyApiV1.onUnlock}
          onError={portkeyApiV1.onError}
          extraWallets={renderExtraWallets()}
        />
      ) : (
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
      ),
    [
      loginState,
      modalOpen,
      portkeyApi.isManagerExists,
      portkeyApi.onCancel,
      portkeyApi.onError,
      portkeyApi.onFinished,
      portkeyApi.onUnlock,
      portkeyApiV1.isManagerExists,
      portkeyApiV1.onCancel,
      portkeyApiV1.onError,
      portkeyApiV1.onFinished,
      portkeyApiV1.onUnlock,
      portkeyOpts,
      renderExtraWallets,
      version,
    ],
  );

  const PortkeyPage = useMemo(() => {
    return isShowUnlockPage || portkeyOpts.noCommonBaseModal ? (
      PortkeySDKEle
    ) : (
      <CommonBaseModal
        destroyOnClose
        className={clsx('portkey-ui-sign-modal', `portkey-ui-sign-modal-${portkeyOpts.design}`)}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        open={modalOpen}
        // getContainer={getContainer ? getContainer : `#${PORTKEY_ROOT_ID}`}
        onClose={version === 'v1' ? portkeyApiV1.onCancel : portkeyApi.onCancel}>
        {PortkeySDKEle}
      </CommonBaseModal>
    );
  }, [PortkeySDKEle, isShowUnlockPage, modalOpen, portkeyOpts.design]);

  return (
    <WebLoginContext.Provider value={state}>
      {children}
      {PortkeyPage}
      <ConfirmLogoutDialogComponent
        visible={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmResult(LogoutConfirmResult.cancel)}
        onOk={() => setLogoutConfirmResult(LogoutConfirmResult.ok)}
      />

      <PortkeyLoading loading={loading} />
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
