import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChainId } from '@portkey/types';
import { IPortkeyProvider, Accounts } from '@portkey/provider-types';
import detectProvider from '@portkey/detect-provider';
import { getConfig } from '../../config';
import { CallContractParams, DiscoverInfo, SignatureParams, WalletHookInterface, WalletHookParams } from '../types';
import { WalletType, WebLoginState } from '../../constants';
import checkSignatureParams from '../../utils/signatureParams';

export type DiscoverInterface = WalletHookInterface & {};

const LOGIN_EARGLY_KEY = 'discover.loginEargly';

export function useDiscover({
  autoRequestAccount,
  checkAccountInfoSync,
  loginState,
  setWalletType,
  setLoginError,
  setLoginState,
  setLoading,
}: WalletHookParams & {
  checkAccountInfoSync: boolean | undefined;
  autoRequestAccount: boolean;
  setModalOpen: (open: boolean) => void;
}) {
  const chainId = getConfig().chainId as ChainId;

  const autoRequestAccountCheck = useRef(false);
  const [discoverProvider, setDiscoverProvider] = useState<IPortkeyProvider>();
  const [discoverInfo, setDiscoverInfo] = useState<DiscoverInfo>();

  // const shouldCheckAccountInfoSync = !!didWalletInfo && (checkAccountInfoSync === undefined || checkAccountInfoSync);
  // const accountInfoSync = useAccountInfoSync(chainId, loginState, shouldCheckAccountInfoSync, didWalletInfo);

  const detect = useCallback(async () => {
    if (discoverProvider?.isConnected()) {
      return;
    }
    const provider = await detectProvider();
    if (provider && provider.isPortkey) {
      setDiscoverProvider(provider);
    }
  }, [discoverProvider]);

  const onAccountsSuccess = useCallback(
    async (accounts: Accounts) => {
      const provider = discoverProvider! as IPortkeyProvider;
      setLoginError(undefined);
      let nickName = '';
      try {
        nickName = await provider.request({ method: 'wallet_getWalletName' });
      } catch (error) {
        console.warn(error);
      }
      localStorage.setItem(LOGIN_EARGLY_KEY, 'true');
      setDiscoverInfo({
        address: accounts[chainId]![0],
        nickName,
      });
      setWalletType(WalletType.discover);
      setLoginState(WebLoginState.logined);
    },
    [chainId, discoverProvider, setLoginError, setLoginState, setWalletType],
  );

  const onAccountsFail = useCallback(
    (error: any) => {
      localStorage.removeItem(LOGIN_EARGLY_KEY);
      setLoginError(error);
      setDiscoverInfo(undefined);
      setLoginState(WebLoginState.initial);
    },
    [setLoginError, setLoginState],
  );

  const loginEagerly = useCallback(async () => {
    setLoginState(WebLoginState.logining);
    const provider = discoverProvider! as IPortkeyProvider;
    try {
      const accounts = await provider.request({ method: 'accounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        onAccountsSuccess(accounts);
      } else {
        onAccountsFail(undefined);
      }
    } catch (error) {
      onAccountsFail(error);
    }
    // TODO:
  }, [chainId, discoverProvider, onAccountsFail, onAccountsSuccess, setLoginState]);

  const login = useCallback(async () => {
    setLoginState(WebLoginState.logining);
    try {
      detect();
      const provider = discoverProvider! as IPortkeyProvider;
      const accounts = await provider.request({ method: 'requestAccounts' });
      if (accounts[chainId] && accounts[chainId]!.length > 0) {
        onAccountsSuccess(accounts);
      } else {
        onAccountsFail(undefined);
      }
    } catch (error) {
      onAccountsFail(error);
    }
  }, [chainId, detect, discoverProvider, onAccountsFail, onAccountsSuccess, setLoginState]);

  const logout = useCallback(async () => {
    setLoginState(WebLoginState.logouting);
    try {
      localStorage.removeItem(LOGIN_EARGLY_KEY);
    } catch (e) {
      console.warn(e);
    }
    setDiscoverInfo(undefined);
    setLoginError(undefined);
    setLoginState(WebLoginState.initial);
  }, [setLoginError, setLoginState]);

  const callContract = useCallback(
    async function callContractFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      if (!discoverInfo) {
        throw new Error('Discover not connected');
      }
      // TODO ..
      const result = undefined;
      return result as R;
    },
    [discoverInfo],
  );

  const getSignature = useCallback(
    async (params: SignatureParams) => {
      checkSignatureParams(params);
      if (!discoverInfo) {
        throw new Error('Discover not connected');
      }
      const provider = discoverProvider! as IPortkeyProvider;
      const signInfo = params.signInfo;
      if (params.hexToBeSign) {
        throw new Error('discover is not support hexToBeSign, please use signInfo');
      }
      const signedMsgObject = await provider.request({
        method: 'wallet_getSignature',
        payload: {
          data: signInfo,
        },
      });
      const signedMsgString = [
        signedMsgObject.r.toString(16, 64),
        signedMsgObject.s.toString(16, 64),
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
    const canLoginEargly = autoRequestAccount && !!localStorage.getItem(LOGIN_EARGLY_KEY);
    if (canLoginEargly) {
      if (canLoginEargly && loginState === WebLoginState.initial) {
        loginEagerly();
      } else {
        setLoginState(WebLoginState.eagerly);
      }
    }
  }, [loginEagerly, setLoginState, loginState, autoRequestAccount]);

  return useMemo<DiscoverInterface>(
    () => ({
      wallet: {
        name: discoverInfo?.nickName || '',
        address: discoverInfo?.address || '',
        publicKey: '',
        discoverInfo,
        accountInfoSync: {
          syncCompleted: loginState === WebLoginState.logined,
          holderInfo: undefined,
        },
      },
      discoverDetected: !!discoverProvider,
      loginEagerly,
      login,
      logout,
      callContract,
      getSignature,
    }),
    [discoverInfo, loginState, discoverProvider, loginEagerly, login, logout, callContract, getSignature],
  );
}
