import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChainId } from '@portkey/types';
import { IPortkeyProvider, Accounts, ChainIds, NetworkType, ProviderError } from '@portkey/provider-types';
import detectProvider from '@portkey/detect-provider';
import { getConfig } from '../../config';
import {
  CallContractParams,
  DiscoverInfo,
  DoSwitchFunc,
  SignatureParams,
  SwitchWalletFunc,
  WalletHookInterface,
} from '../../types';
import { WalletHookParams } from '../types';
import { WalletType, WebLoginEvents, WebLoginState } from '../../constants';
import checkSignatureParams from '../../utils/signatureParams';
import { DiscoverOptions } from 'src/types';
import useChainIdsSync from './useChainIdsSync';
import { ERR_CODE, makeError } from '../../errors';
import wait from '../../utils/waitForSeconds';
import { zeroFill } from '../../utils/zeroFill';

export type DiscoverDetectState = 'unknown' | 'detected' | 'not-detected';
export type DiscoverInterface = WalletHookInterface & {
  discoverDetected: DiscoverDetectState;
};

export const LOGIN_EARGLY_KEY = 'discover.loginEargly';

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
  const [discoverInfo, setDiscoverInfo] = useState<DiscoverInfo>();
  const [discoverDetected, setDiscoverDetected] = useState<DiscoverDetectState>('unknown');
  const [switching, setSwitching] = useState(false);

  const chainIdsSync = useChainIdsSync(chainId, loginState, true, discoverProvider);

  const detect = useCallback(async (): Promise<IPortkeyProvider> => {
    if (discoverProvider?.isConnected()) {
      return discoverProvider!;
    }
    // TODO: detects in once issue
    let detectProviderFunc = detectProvider;
    if (typeof detectProvider !== 'function') {
      const detectProviderModule = detectProvider as any;
      detectProviderFunc = detectProviderModule.default;
    }
    let provider: IPortkeyProvider | null;
    try {
      provider = await detectProviderFunc();
    } catch (error) {
      setDiscoverDetected('not-detected');
      throw error;
    }
    if (provider) {
      if (!provider.isPortkey) {
        setDiscoverDetected('not-detected');
        throw new Error('Discover provider found, but check isPortkey failed');
      }
      setDiscoverProvider(provider);
      setDiscoverDetected('detected');
      return provider;
    } else {
      setDiscoverDetected('not-detected');
      throw new Error('Discover provider not found');
    }
  }, [discoverProvider]);

  useEffect(() => {
    detect().catch((error: any) => {
      console.log(error.message);
    });
  }, []);

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
    try {
      const provider = await detect();
      const { isUnlocked } = await provider.request({ method: 'wallet_getWalletState' });
      if (!isUnlocked) {
        setLoginState(WebLoginState.lock);
        return;
      }
      const network = await provider.request({ method: 'network' });
      if (network !== getConfig().networkType) {
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
    try {
      const provider = await detect();
      const network = await provider.request({ method: 'network' });
      if (network !== getConfig().networkType) {
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

  const logout = useCallback(
    async (isLock = false) => {
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
      setLoginState(isLock ? WebLoginState.lock : WebLoginState.initial);
      eventEmitter.emit(isLock ? WebLoginEvents.LOCK : WebLoginEvents.LOGOUT);
    },
    [eventEmitter, setLoginError, setLoginState, setWalletType, walletType],
  );

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
      if (!discoverInfo || !discoverProvider) {
        throw new Error('Discover not connected');
      }
      const chain = await discoverProvider.getChain(chainId);
      const contract = chain.getContract(params.contractAddress);
      const result = contract.callSendMethod(params.methodName, discoverInfo.address, params.args);
      return result as R;
    },
    [chainId, discoverInfo, discoverProvider],
  );

  const getSignature = useCallback(
    async (params: SignatureParams) => {
      checkSignatureParams(params);
      if (!discoverInfo) {
        throw new Error('Discover not connected');
      }
      const provider = discoverProvider! as IPortkeyProvider;
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
    [discoverInfo, discoverProvider],
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
    if (discoverProvider) {
      const onDisconnected = (error: ProviderError) => {
        if (!discoverInfo) return;
        eventEmitter.emit(WebLoginEvents.DISCOVER_DISCONNECTED, error);
        if (options.autoLogoutOnDisconnected) {
          logout();
        }
      };
      const onNetworkChanged = (networkType: NetworkType) => {
        if (networkType !== getConfig().networkType) {
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
          } else {
            logout(true);
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
      discoverProvider.on('disconnected', onDisconnected);
      discoverProvider.on('networkChanged', onNetworkChanged);
      discoverProvider.on('accountsChanged', onAccountsChanged);
      discoverProvider.on('chainChanged', onChainChanged);
      return () => {
        discoverProvider.removeListener('disconnected', onDisconnected);
        discoverProvider.removeListener('networkChanged', onNetworkChanged);
        discoverProvider.removeListener('accountsChanged', onAccountsChanged);
        discoverProvider.removeListener('chainChanged', onChainChanged);
      };
    }
  }, [
    chainId,
    discoverInfo,
    discoverProvider,
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
