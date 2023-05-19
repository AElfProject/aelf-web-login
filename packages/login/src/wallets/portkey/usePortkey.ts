import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { getContractBasic } from '@portkey/contracts';
import { DIDWalletInfo, did } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';
import { getConfig } from '../../config';
import { CallContractParams, WalletHookInterface, WalletHookParams } from '../types';
import { WalletType, WebLoginState } from '../../constants';

export type PortkeyInterface = WalletHookInterface & {
  isManagerExists: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onFinished: (didWalletInfo: DIDWalletInfo) => void;
};

export function usePortkey({
  autoShowUnlock,
  loginState,
  setWalletType,
  setLoginError,
  setLoginState,
  setModalOpen,
}: WalletHookParams & { autoShowUnlock: boolean; setModalOpen: (open: boolean) => void }) {
  const appName = getConfig().appName;
  const chainId = getConfig().chainId as ChainId;

  const autoUnlockCheckRef = useRef(false);
  const [didWalletInfo, setDidWalletInfo] = useState<DIDWalletInfo>();

  const isManagerExists = !!localStorage.getItem(appName);

  const loginEagerly = useCallback(async () => {
    setLoginState(WebLoginState.logining);
    setModalOpen(true);
  }, [setLoginState, setModalOpen]);

  const login = useCallback(async () => {
    setLoginState(WebLoginState.logining);
    setModalOpen(true);
  }, [setLoginState, setModalOpen]);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem(appName);
      setDidWalletInfo(undefined);
      await did.reset();
    } catch (e) {
      console.warn(e);
    }
    setLoginState(WebLoginState.initial);
  }, [appName, setLoginState]);

  const callContract = useCallback(
    async function callContractFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      if (!didWalletInfo) {
        throw new Error('Portkey not login');
      }
      // TODO: fixes cache contract
      const chainsInfo = await did.services.getChainsInfo();
      const chainInfo = chainsInfo.find((chain) => chain.chainId === chainId);
      if (!chainInfo) {
        throw new Error(`chain is not running: ${chainId}`);
      }
      const caContract = await getContractBasic({
        contractAddress: chainInfo.caContractAddress,
        account: didWalletInfo.walletInfo,
        rpcUrl: chainInfo.endPoint,
      });
      const result = await caContract.callSendMethod('ManagerForwardCall', didWalletInfo.walletInfo.address, {
        caHash: didWalletInfo.caInfo.caHash,
        contractAddress: params.contractAddress,
        methodName: params.methodName,
        args: params.args,
      });
      return result as R;
    },
    [chainId, didWalletInfo],
  );

  useEffect(() => {
    if (autoUnlockCheckRef.current) {
      return;
    }
    autoUnlockCheckRef.current = true;
    const canShowUnlock = isManagerExists;
    if (canShowUnlock) {
      if (autoShowUnlock && loginState === WebLoginState.initial) {
        loginEagerly();
      } else {
        setLoginState(WebLoginState.lock);
      }
    }
  }, [isManagerExists, loginEagerly, setLoginState, autoShowUnlock, loginState]);

  const onUnlock = useCallback(
    async (password: string) => {
      const localWallet = await did.load(password, appName);
      if (!localWallet.didWallet.accountInfo.loginAccount) {
        return Promise.resolve(false);
      }

      let caInfo = localWallet.didWallet.caInfo[chainId];
      let caHash = caInfo?.caHash;
      if (!caInfo) {
        const key = Object.keys(localWallet.didWallet.caInfo)[0];
        caHash = localWallet.didWallet.caInfo[key].caHash;
        caInfo = await did.didWallet.getHolderInfoByContract({
          caHash: caHash,
          chainId: chainId as ChainId,
        });
      }

      const didWalletInfo: DIDWalletInfo = {
        caInfo,
        pin: password,
        chainId: chainId as ChainId,
        // TODO: fixes any
        walletInfo: localWallet.didWallet.managementAccount!.wallet as any,
        accountInfo: localWallet.didWallet.accountInfo as any,
      };
      setDidWalletInfo(didWalletInfo);
      setWalletType(WalletType.portkey);
      setLoginState(WebLoginState.logined);
      return Promise.resolve(true);
    },
    [appName, chainId, setLoginState, setWalletType],
  );

  const onFinished = useCallback(
    async (didWalletInfo: DIDWalletInfo) => {
      try {
        if (didWalletInfo.chainId !== chainId) {
          const caInfo = await did.didWallet.getHolderInfoByContract({
            caHash: didWalletInfo.caInfo.caHash,
            chainId: chainId,
          });
          didWalletInfo.caInfo = {
            caAddress: caInfo.caAddress,
            caHash: caInfo.caHash,
          };
        }
        await did.save(didWalletInfo.pin, appName);
        setDidWalletInfo(didWalletInfo);
        setWalletType(WalletType.portkey);
        setLoginState(WebLoginState.logined);
      } catch (error) {
        setLoginError(error);
        setLoginState(WebLoginState.initial);
      }
    },
    [appName, chainId, setLoginError, setLoginState, setWalletType],
  );

  return useMemo<PortkeyInterface>(
    () => ({
      isManagerExists,
      wallet: { address: didWalletInfo?.caInfo.caAddress || '' },
      loginEagerly,
      login,
      logout,
      callContract,
      onFinished,
      onUnlock,
    }),
    [callContract, didWalletInfo?.caInfo.caAddress, isManagerExists, login, loginEagerly, logout, onFinished, onUnlock],
  );
}
