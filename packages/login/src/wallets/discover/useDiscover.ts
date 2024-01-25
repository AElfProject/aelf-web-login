import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChainId } from '@portkey/types';
import { IPortkeyProvider, Accounts, ChainIds, NetworkType, ProviderError, DappEvents } from '@portkey/provider-types';
import { event$, getConfig } from '../../config';
import {
  CallContractParams,
  DiscoverInfo,
  DoSwitchFunc,
  SignatureParams,
  SwitchWalletFunc,
  WalletHookInterface,
} from '../../types';
import { WalletHookParams } from '../types';
import { WEB_LOGIN_VERSION, WalletType, WebLoginEvents, WebLoginState } from '../../constants';
import checkSignatureParams from '../../utils/signatureParams';
import { DiscoverOptions } from 'src/types';
import useChainIdsSync from './useChainIdsSync';
import { ERR_CODE, makeError } from '../../errors';
import wait from '../../utils/waitForSeconds';
import { zeroFill } from '../../utils/zeroFill';
import detectDiscoverProvider from './detectProvider';
import useWebLoginEvent from '../../hooks/useWebLoginEvent';
import { useWebLogin } from '../../context';

export type DiscoverDetectState = 'unknown' | 'detected' | 'not-detected';
export type DiscoverInterface = WalletHookInterface & {
  discoverDetected: DiscoverDetectState;
};

export const LOGIN_EARGLY_KEY = 'discover.loginEargly';
type TDiscoverEventsKeys = Array<Exclude<DappEvents, 'connected' | 'message' | 'error'>>;

export function useDiscover({
  options,
  eventEmitter,
  loginState,
  walletType,
  setWalletType,
  setLoginError,
  setLoginState,
  setLoading,
}: WalletHookParams<DiscoverOptions>) {
  const chainId = getConfig().chainId as ChainId;
  const autoRequestAccountCheck = useRef(false);
  const [discoverProvider, setDiscoverProvider] = useState<IPortkeyProvider>();
  const [discoverProviderV1, setDiscoverProviderV1] = useState<IPortkeyProvider>();
  const [discoverInfo, setDiscoverInfo] = useState<DiscoverInfo>();
  const [discoverDetected, setDiscoverDetected] = useState<DiscoverDetectState>('unknown');
  const [switching, setSwitching] = useState(false);

  const chainIdsSync = useChainIdsSync(chainId, loginState, true, discoverProvider);

  event$.useSubscription((value: any) => {
    // init
    setDiscoverDetected('unknown');
    setTimeout(() => {
      detect().catch((error: any) => {
        console.log(error.message);
      });
    }, 0);
  });

  const handleMultiVersionProvider = useCallback(
    async (
      provider: IPortkeyProvider,
      setProvider: React.Dispatch<React.SetStateAction<IPortkeyProvider | undefined>>,
    ) => {
      if (provider?.isConnected()) {
        setDiscoverDetected('detected');
        return provider!;
      }
      const detectedProvider = await detectDiscoverProvider();
      if (detectedProvider) {
        if (!detectedProvider.isPortkey) {
          setDiscoverDetected('not-detected');
          throw new Error('Discover provider found, but check isPortkey failed');
        }
        setProvider(detectedProvider);
        setDiscoverDetected('detected');
        return detectedProvider;
      } else {
        setDiscoverDetected('not-detected');
        throw new Error('Discover provider not found');
      }
    },
    [],
  );

  const detect = useCallback(
    async (changedVerison?: string): Promise<IPortkeyProvider> => {
      const version = changedVerison || localStorage.getItem(WEB_LOGIN_VERSION);
      if (version === 'v1') {
        return handleMultiVersionProvider(discoverProviderV1!, setDiscoverProviderV1);
      }
      return handleMultiVersionProvider(discoverProvider!, setDiscoverProvider);
    },
    [discoverProvider, discoverProviderV1, handleMultiVersionProvider],
  );

  useEffect(() => {
    detect().catch((error: any) => {
      console.log(error.message);
    });
  }, [detect]);

  const onAccountsSuccess = useCallback(
    async (provider: IPortkeyProvider, accounts: Accounts) => {
      setLoginError(undefined);
      let nickName = 'Wallet 01';
      const address = accounts[chainId]![0].split('_')[1];
      try {
        nickName = await provider.request({ method: 'wallet_getWalletName' });
      } catch (error) {
        console.warn(error);
      }
      localStorage.setItem(LOGIN_EARGLY_KEY, 'true');
      setDiscoverInfo({
        address,
        accounts,
        nickName,
        provider,
      });
      setWalletType(WalletType.discover);
      setLoginState(WebLoginState.logined);
      setLoading(false);
      eventEmitter.emit(WebLoginEvents.LOGINED);
    },
    [chainId, eventEmitter, setLoading, setLoginError, setLoginState, setWalletType],
  );

  const onAccountsFail = useCallback(
    (error: any) => {
      localStorage.removeItem(LOGIN_EARGLY_KEY);
      setLoading(false);
      setLoginError(error);
      setDiscoverInfo(undefined);
      setWalletType(WalletType.unknown);
      setLoginState(WebLoginState.initial);
      eventEmitter.emit(WebLoginEvents.LOGIN_ERROR, error);
    },
    [eventEmitter, setLoading, setLoginError, setLoginState, setWalletType],
  );

  const loginEagerly = useCallback(async () => {
    setLoginState(WebLoginState.logining);
    const version = localStorage.getItem(WEB_LOGIN_VERSION);
    try {
      const provider = await detect();
      const { isUnlocked } = await provider.request({ method: 'wallet_getWalletState' });
      if (!isUnlocked) {
        setLoginState(WebLoginState.initial);
        return;
      }
      const network = await provider.request({ method: 'network' });
      if (network !== (version === 'v1' ? getConfig().networkType : getConfig().portkeyV2?.networkType)) {
        onAccountsFail(makeError(ERR_CODE.NETWORK_TYPE_NOT_MATCH));
        return;
      }
      const accounts = await provider.request({ method: 'accounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        onAccountsSuccess(provider, accounts);
      } else {
        onAccountsFail(makeError(ERR_CODE.DISCOVER_LOGIN_EAGERLY_FAIL));
      }
    } catch (error: any) {
      onAccountsFail({
        code: 10001,
        message: error?.message || 'unknown error',
        nativeError: error,
      });
    }
  }, [chainId, detect, onAccountsFail, onAccountsSuccess, setLoginState]);

  const login = useCallback(async () => {
    setLoading(true);
    setLoginState(WebLoginState.logining);
    const version = localStorage.getItem(WEB_LOGIN_VERSION);
    try {
      const provider = await detect();
      const network = await provider.request({ method: 'network' });
      if (network !== (version === 'v1' ? getConfig().networkType : getConfig().portkeyV2?.networkType)) {
        onAccountsFail(makeError(ERR_CODE.NETWORK_TYPE_NOT_MATCH));
        return;
      }
      let accounts = await provider.request({ method: 'accounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        onAccountsSuccess(provider, accounts);
        return;
      }
      accounts = await provider.request({ method: 'requestAccounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        onAccountsSuccess(provider, accounts);
      } else {
        setLoading(false);
        onAccountsFail(makeError(ERR_CODE.ACCOUNTS_IS_EMPTY));
      }
    } catch (error) {
      setLoading(false);
      onAccountsFail(error);
    }
  }, [chainId, detect, onAccountsFail, onAccountsSuccess, setLoading, setLoginState]);

  const logout = useCallback(async () => {
    if (walletType !== WalletType.discover) {
      try {
        localStorage.removeItem(LOGIN_EARGLY_KEY);
      } catch (e) {
        console.warn(e);
      }
      setDiscoverInfo(undefined);
      return;
    }

    setLoginState(WebLoginState.logouting);
    await wait(500);
    try {
      localStorage.removeItem(LOGIN_EARGLY_KEY);
    } catch (e) {
      console.warn(e);
    }
    setLoginError(undefined);
    setDiscoverInfo(undefined);
    setWalletType(WalletType.unknown);
    setLoginState(WebLoginState.initial);
    eventEmitter.emit(WebLoginEvents.LOGOUT);
  }, [eventEmitter, setLoginError, setLoginState, setWalletType, walletType]);

  const logoutSilently = useCallback(async () => {
    try {
      localStorage.removeItem(LOGIN_EARGLY_KEY);
    } catch (e) {
      console.warn(e);
    }
    setDiscoverInfo(undefined);
  }, []);

  const switchWallet: SwitchWalletFunc = useCallback(
    async (doSwitch: DoSwitchFunc) => {
      if (loginState !== WebLoginState.logined) {
        throw new Error(`Switch wallet on invalid state: ${loginState}`);
      }
      if (switching) {
        throw new Error('Switching wallet');
      }
      setSwitching(true);
      await doSwitch(
        async () => {
          try {
            localStorage.removeItem(LOGIN_EARGLY_KEY);
          } catch (e) {
            console.warn(e);
          }
          setDiscoverInfo(undefined);
          setSwitching(false);
        },
        async () => {
          setSwitching(false);
          setWalletType(WalletType.discover);
          setLoginState(WebLoginState.logined);
        },
      );
    },
    [loginState, setLoginState, setWalletType, switching],
  );

  const callContract = useCallback(
    async function callContractFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      const version = localStorage.getItem(WEB_LOGIN_VERSION);
      const provider = version === 'v1' ? discoverProviderV1! : discoverProvider!;
      if (!discoverInfo || !provider) {
        throw new Error('Discover not connected');
      }
      const chain = await provider.getChain(chainId);
      const contract = chain.getContract(params.contractAddress);
      const result = contract.callSendMethod(params.methodName, discoverInfo.address, params.args);
      return result as R;
    },
    [chainId, discoverInfo, discoverProvider, discoverProviderV1],
  );

  const getSignature = useCallback(
    async (params: SignatureParams) => {
      checkSignatureParams(params);
      if (!discoverInfo) {
        throw new Error('Discover not connected');
      }
      const version = localStorage.getItem(WEB_LOGIN_VERSION);
      const provider = version === 'v1' ? discoverProviderV1! : discoverProvider!;
      const signInfo = params.signInfo;
      const signedMsgObject = await provider.request({
        method: 'wallet_getSignature',
        payload: {
          data: signInfo || params.hexToBeSign,
        },
      });
      const signedMsgString = [
        zeroFill(signedMsgObject.r),
        zeroFill(signedMsgObject.s),
        `0${signedMsgObject.recoveryParam!.toString()}`,
      ].join('');
      return {
        error: 0,
        errorMessage: '',
        signature: signedMsgString,
        from: 'discover',
      };
    },
    [discoverInfo, discoverProvider, discoverProviderV1],
  );

  useEffect(() => {
    if (autoRequestAccountCheck.current) {
      return;
    }
    autoRequestAccountCheck.current = true;
    const canLoginEargly = !!localStorage.getItem(LOGIN_EARGLY_KEY);
    if (canLoginEargly) {
      if (options.autoRequestAccount) {
        if (loginState === WebLoginState.initial) {
          loginEagerly();
        }
      } else {
        setLoginState(WebLoginState.eagerly);
      }
    }
  }, [loginEagerly, setLoginState, loginState, options.autoRequestAccount]);

  useEffect(() => {
    const version = localStorage.getItem(WEB_LOGIN_VERSION);
    const provider = version === 'v1' ? discoverProviderV1 : discoverProvider;
    if (provider) {
      const onDisconnected = (error: ProviderError) => {
        if (!discoverInfo) return;
        eventEmitter.emit(WebLoginEvents.DISCOVER_DISCONNECTED, error);
        if (options.autoLogoutOnDisconnected) {
          logout();
        }
      };
      const onNetworkChanged = (networkType: NetworkType) => {
        if (networkType !== (version === 'v1' ? getConfig().networkType : getConfig().portkeyV2?.networkType)) {
          eventEmitter.emit(WebLoginEvents.NETWORK_MISMATCH, networkType);
          if (options.autoLogoutOnNetworkMismatch) {
            logout();
          }
        }
      };
      const onAccountsChanged = (accounts: Accounts) => {
        if (!discoverInfo) return;
        if (
          !accounts[chainId] ||
          accounts[chainId]!.length === 0 ||
          accounts[chainId]!.find((addr) => addr !== discoverInfo!.address)
        ) {
          eventEmitter.emit(WebLoginEvents.ACCOUNTS_MISMATCH, accounts);
          if (options.autoLogoutOnAccountMismatch) {
            logout();
          }
        }
      };
      const onChainChanged = (chainIds: ChainIds) => {
        if (chainIds.find((id) => id === chainId)) {
          eventEmitter.emit(WebLoginEvents.CHAINID_MISMATCH, chainIds);
          if (options.autoLogoutOnChainMismatch) {
            logout();
          }
        }
      };

      const discoverEventsMap = {
        disconnected: onDisconnected,
        networkChanged: onNetworkChanged,
        accountsChanged: onAccountsChanged,
        chainChanged: onChainChanged,
      };
      (Object.keys(discoverEventsMap) as TDiscoverEventsKeys).forEach((ele) => {
        provider.on(ele, discoverEventsMap[ele]);
      });

      return () => {
        (Object.keys(discoverEventsMap) as TDiscoverEventsKeys).forEach((ele) => {
          provider.removeListener(ele, discoverEventsMap[ele]);
        });
      };
    }
  }, [
    chainId,
    discoverInfo,
    discoverProvider,
    discoverProviderV1,
    eventEmitter,
    logout,
    options.autoLogoutOnAccountMismatch,
    options.autoLogoutOnChainMismatch,
    options.autoLogoutOnDisconnected,
    options.autoLogoutOnNetworkMismatch,
  ]);

  return useMemo<DiscoverInterface>(
    () => ({
      wallet: {
        name: discoverInfo?.nickName || '',
        address: discoverInfo?.address || '',
        publicKey: '',
        discoverInfo,
        accountInfoSync: {
          syncCompleted: chainIdsSync.syncCompleted,
          chainIds: chainIdsSync.chainIds,
          holderInfo: undefined,
        },
      },
      discoverDetected,
      loginEagerly,
      login,
      logout,
      logoutSilently,
      switchWallet,
      loginBySwitch: login,
      logoutBySwitch: logout,
      callContract,
      getSignature,
    }),
    [
      discoverInfo,
      chainIdsSync.syncCompleted,
      chainIdsSync.chainIds,
      discoverDetected,
      loginEagerly,
      login,
      logout,
      logoutSilently,
      switchWallet,
      callContract,
      getSignature,
    ],
  );
}
