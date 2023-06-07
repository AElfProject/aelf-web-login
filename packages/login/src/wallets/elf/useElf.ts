import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { useAElfReact } from '@aelf-react/core';
import { getConfig } from '../../config';
import { CallContractParams, SignatureParams, WalletHookInterface, WalletHookParams } from '../types';
import { WalletType, WebLoginState } from '../../constants';

export function useElf({
  isConnectEagerly,
  loginState,
  setLoginError,
  setLoginState,
  setWalletType,
}: WalletHookParams & { isConnectEagerly: boolean }) {
  const chainId = getConfig().chainId;
  const nodes = getConfig().aelfReact.nodes;

  const eagerlyCheckRef = useRef(false);
  const initializingRef = useRef(false);
  const { isActive, account, pubKey, name, aelfBridges, activate, connectEagerly, deactivate } = useAElfReact();
  const nightElfInfo = useAElfReact();

  const bridge = useMemo(() => {
    return aelfBridges?.[chainId];
  }, [aelfBridges, chainId]);

  const chain = useMemo(() => {
    const bridge = aelfBridges?.[chainId];
    return bridge?.chain;
  }, [aelfBridges, chainId]);

  const initialWallet = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    try {
      await chain!.getChainStatus();
      setWalletType(WalletType.elf);
      setLoginState(WebLoginState.logined);
    } catch (error) {
      setLoginError(error);
      setLoginState(WebLoginState.initial);
    }
    initializingRef.current = false;
  }, [chain, setWalletType, setLoginState, setLoginError]);

  useEffect(() => {
    if (isActive && loginState === WebLoginState.logining) {
      initialWallet();
    }
  }, [isActive, loginState, initialWallet]);

  const loginEagerly = useCallback(async () => {
    try {
      console.log('connectEagerly', loginState);
      setLoginState(WebLoginState.logining);
      await connectEagerly(nodes);
    } catch (e) {
      localStorage.removeItem('aelf-connect-eagerly');
      setLoginError(e);
      setLoginState(WebLoginState.initial);
    }
  }, [connectEagerly, loginState, nodes, setLoginError, setLoginState]);

  const login = useCallback(async () => {
    try {
      setLoginState(WebLoginState.logining);
      await activate(nodes);
    } catch (e) {
      setLoginError(e);
    }
  }, [activate, nodes, setLoginError, setLoginState]);

  const logout = useCallback(async () => {
    setLoginState(WebLoginState.logouting);
    try {
      localStorage.removeItem('aelf-connect-eagerly');
      await deactivate();
    } catch (e) {
      console.warn(e);
    }
    setLoginState(WebLoginState.initial);
  }, [deactivate, setLoginState]);

  const callContract = useCallback(
    async function callContractFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      if (!isActive || !account || !chain) {
        throw new Error('Elf not login');
      }
      // TODO: fixes cache contract
      const contract = await chain.contractAt(params.contractAddress, {
        address: account!,
      });
      return await contract[params.methodName](params.args);
    },
    [isActive, chain, account],
  );

  const getSignature = useCallback(
    async (params: SignatureParams) => {
      if (!bridge || !isActive) {
        throw new Error('Elf not login');
      }
      const signature = await bridge!.getSignature(params);
      return signature;
    },
    [bridge, isActive],
  );

  useEffect(() => {
    if (eagerlyCheckRef.current) {
      return;
    }
    eagerlyCheckRef.current = true;
    const canEagerly = localStorage.getItem('aelf-connect-eagerly') === 'true';
    if (canEagerly) {
      if (isConnectEagerly) {
        if (loginState === WebLoginState.initial) {
          loginEagerly();
        }
      } else {
        setLoginState(WebLoginState.eagerly);
      }
    }
  }, [loginState, isConnectEagerly, loginEagerly, setLoginState]);

  return useMemo<WalletHookInterface>(
    () => ({
      wallet: {
        name,
        address: account || '',
        publicKey: pubKey,
        nightElfInfo,
        accountInfoSync: {
          syncCompleted: loginState === WebLoginState.logined,
          holderInfos: undefined,
        },
      },
      loginEagerly,
      login,
      logout,
      callContract,
      getSignature,
    }),
    [name, account, pubKey, nightElfInfo, loginState, loginEagerly, login, logout, callContract, getSignature],
  );
}
