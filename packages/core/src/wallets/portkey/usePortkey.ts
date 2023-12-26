import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { getContractBasic } from '@portkey/contracts';
import { DIDWalletInfo } from '@portkey/did-ui-react';
import { CallContractParams, PortkeyInfo, PortkeyOptions, SignatureParams, WalletHookInterface } from 'src/types';
import { WalletHookParams } from '../types';
import { getConfig } from '../../config';
import { PORTKEY_ORIGIN_CHAIN_ID_KEY, WalletType, WebLoginEvents, WebLoginState } from '../../constants';
import { ChainId } from '@portkey/types';
import { WebLoginInstance } from '../../injectPortkey';

export type PortkeyInterface = WalletHookInterface & {
  isManagerExists: boolean;
  isUnlocking: boolean;
  isPreparing: boolean;
  lock: () => void;
  onError: (error: any) => void;
  onFinished: (didWalletInfo: DIDWalletInfo) => void;
  onCancel: () => void;
  onUnlock: (password: string) => Promise<boolean>;
};

export function usePortkey({
  options,
  loginState,
  eventEmitter,
  setWalletType,
  setLoginError,
  setLoginState,
  setModalOpen,
  setLoading,
}: WalletHookParams<PortkeyOptions> & {
  setModalOpen: (open: boolean) => void;
}) {
  const appName = getConfig().appName;
  const chainId = getConfig().chainId as ChainId;

  const autoUnlockCheckRef = useRef(false);
  const [didWalletInfo, setDidWalletInfo] = useState<PortkeyInfo>();
  const [isUnlocking, setUnlocking] = useState(false);
  const [isPreparing, setPreparing] = useState(false);
  const isManagerExists = useMemo(() => {
    return loginState && !!localStorage.getItem(appName);
  }, [appName, loginState]);
  const portkeyInstance = new WebLoginInstance().getPortkey();

  const loginEagerly = useCallback(async () => {
    setLoginState(WebLoginState.logining);
    setModalOpen(true);
  }, [setLoginState, setModalOpen]);

  const login = useCallback(async () => {
    setLoginState(WebLoginState.logining);
    setModalOpen(true);
  }, [setLoginState, setModalOpen]);

  const logout = useCallback(async () => {
    setLoginState(WebLoginState.logouting);
    try {
      const originChainId = localStorage.getItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
      localStorage.removeItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
      if (originChainId) {
        await portkeyInstance.did.logout({
          chainId: originChainId as ChainId,
        });
      }
    } catch (e) {
      console.warn(e);
    }
    localStorage.removeItem(appName);
    setDidWalletInfo(undefined);
    setLoginState(WebLoginState.initial);
    eventEmitter.emit(WebLoginEvents.LOGOUT);
  }, [appName, eventEmitter, setLoginState]);

  const logoutSilently = useCallback(async () => {
    setDidWalletInfo(undefined);
    localStorage.removeItem(appName);
    const originChainId = localStorage.getItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
    localStorage.removeItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
    try {
      if (originChainId) {
        await portkeyInstance.did.logout({
          chainId: originChainId as ChainId,
        });
      }
    } catch (e) {
      console.warn(e);
    }
  }, [appName]);

  const lock = useCallback(async () => {
    if (!didWalletInfo) {
      throw new Error(`lock on invalid didWalletInfo: ${didWalletInfo}`);
    }
    if (loginState !== WebLoginState.logined) {
      throw new Error(`lock on invalid login state: ${loginState}`);
    }
    try {
      await portkeyInstance.did.reset();
    } catch (e) {
      console.warn(e);
    }
    setDidWalletInfo(undefined);
    setLoginState(WebLoginState.lock);
    eventEmitter.emit(WebLoginEvents.LOCK);
  }, [didWalletInfo, eventEmitter, loginState, setLoginState]);

  const callContract = useCallback(
    async function callContractFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      if (!didWalletInfo) {
        throw new Error('Portkey not login');
      }
      // TODO: fixes cache contract
      const chainsInfo = await portkeyInstance.did.services.getChainsInfo();
      const chainInfo = chainsInfo.find((chain: any) => chain.chainId === chainId);
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

  const getSignature = useCallback(
    async (params: SignatureParams) => {
      if (!didWalletInfo) {
        throw new Error('Portkey not login');
      }
      let signInfo = '';
      if (params.hexToBeSign) {
        signInfo = params.hexToBeSign;
      } else {
        signInfo = params.signInfo;
      }
      const signature = portkeyInstance.did.sign(signInfo).toString('hex');
      return {
        error: 0,
        errorMessage: '',
        signature,
        from: 'portkey',
      };
    },
    [didWalletInfo],
  );

  const onUnlock = useCallback(
    async (password: string) => {
      setUnlocking(true);
      try {
        const localWallet = await portkeyInstance.did.load(password, appName);
        if (!localWallet.didWallet.accountInfo.loginAccount) {
          return Promise.resolve(false);
        }

        setLoading(true);
        let caInfo = localWallet.didWallet.caInfo[chainId];
        let caHash = caInfo?.caHash;
        if (!caInfo) {
          const key = Object.keys(localWallet.didWallet.caInfo)[0];
          caHash = localWallet.didWallet.caInfo[key].caHash;
          caInfo = await portkeyInstance.did.didWallet.getHolderInfoByContract({
            caHash: caHash,
            chainId: chainId as ChainId,
          });
        }

        const originChainId = localStorage.getItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
        let nickName = localWallet.didWallet.accountInfo.nickName || 'Wallet 01';
        if (originChainId) {
          try {
            const holderInfo = await portkeyInstance.did.getCAHolderInfo(originChainId as ChainId);
            nickName = holderInfo.nickName;
          } catch (error) {
            console.warn(error);
          }
        }

        const didWalletInfo: DIDWalletInfo = {
          caInfo,
          pin: password,
          chainId: originChainId as ChainId,
          walletInfo: localWallet.didWallet.managementAccount!.wallet as any,
          accountInfo: localWallet.didWallet.accountInfo as any,
        };
        setLoading(false);
        setDidWalletInfo({
          ...didWalletInfo,
          accounts: {
            [chainId]: caInfo.caAddress,
          },
          nickName,
        });
        setWalletType(WalletType.portkey);
        setLoginState(WebLoginState.logined);
        eventEmitter.emit(WebLoginEvents.LOGINED);
        return Promise.resolve(true);
      } catch (error) {
        localStorage.removeItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
        setLoading(false);
        setLoginError(error);
        setWalletType(WalletType.unknown);
        setLoginState(WebLoginState.initial);
        eventEmitter.emit(WebLoginEvents.LOGIN_ERROR, error);
        return Promise.resolve(false);
      } finally {
        setUnlocking(false);
      }
    },
    [appName, chainId, eventEmitter, setLoading, setLoginError, setLoginState, setWalletType],
  );

  useEffect(() => {
    if (autoUnlockCheckRef.current) {
      return;
    }
    autoUnlockCheckRef.current = true;
    const canShowUnlock = isManagerExists;
    if (canShowUnlock) {
      if (options.autoShowUnlock && loginState === WebLoginState.initial) {
        loginEagerly();
      } else {
        setLoginState(WebLoginState.lock);
      }
    }
  }, [isManagerExists, loginEagerly, setLoginState, loginState, options.autoShowUnlock]);

  const onFinished = useCallback(
    async (didWalletInfo: DIDWalletInfo) => {
      setPreparing(true);
      try {
        localStorage.setItem(PORTKEY_ORIGIN_CHAIN_ID_KEY, didWalletInfo.chainId);
        if (didWalletInfo.chainId !== chainId) {
          const caInfo = await portkeyInstance.did.didWallet.getHolderInfoByContract({
            caHash: didWalletInfo.caInfo.caHash,
            chainId: chainId,
          });
          didWalletInfo.caInfo = {
            caAddress: caInfo.caAddress,
            caHash: caInfo.caHash,
          };
        }

        let nickName = 'Wallet 01';
        try {
          const holderInfo = await portkeyInstance.did.getCAHolderInfo(didWalletInfo.chainId);
          nickName = holderInfo.nickName;
        } catch (error) {
          console.warn(error);
        }
        try {
          await portkeyInstance.did.save(didWalletInfo.pin, appName);
        } catch (error) {
          console.warn(error);
        }
        setDidWalletInfo({
          ...didWalletInfo,
          accounts: {
            [chainId]: didWalletInfo.caInfo.caAddress,
          },
          nickName,
        });
        setWalletType(WalletType.portkey);
        setLoginState(WebLoginState.logined);
        eventEmitter.emit(WebLoginEvents.LOGINED);
      } catch (error) {
        setLoading(false);
        setDidWalletInfo(undefined);
        setWalletType(WalletType.unknown);
        setLoginError(error);
        setLoginState(WebLoginState.initial);
        eventEmitter.emit(WebLoginEvents.LOGIN_ERROR, error);
      } finally {
        setPreparing(false);
      }
    },
    [appName, chainId, eventEmitter, setLoading, setLoginError, setLoginState, setWalletType],
  );

  const onError = useCallback(
    (error: any) => {
      eventEmitter.emit(WebLoginEvents.ERROR, error);
    },
    [eventEmitter],
  );

  const onCancel = useCallback(() => {
    setModalOpen(false);
    setLoginState(isManagerExists ? WebLoginState.lock : WebLoginState.initial);
    setLoginError(undefined);
    eventEmitter.emit(WebLoginEvents.USER_CANCEL);
    eventEmitter.emit(WebLoginEvents.MODAL_CANCEL);
  }, [setModalOpen, setLoginState, isManagerExists, setLoginError, eventEmitter]);

  return useMemo<PortkeyInterface>(
    () => ({
      isManagerExists,
      isUnlocking,
      isPreparing,
      wallet: {
        name: didWalletInfo?.nickName || 'Wallet 01',
        address: didWalletInfo?.caInfo.caAddress || '',
        publicKey: didWalletInfo?.walletInfo.keyPair.getPublic('hex') || '',
        portkeyInfo: didWalletInfo,
      },
      loginEagerly,
      login,
      logout,
      loginBySwitch: login,
      logoutSilently,
      lock,
      callContract,
      onFinished,
      getSignature,
      onError,
      onCancel,
      onUnlock,
    }),
    [
      isManagerExists,
      isUnlocking,
      isPreparing,
      didWalletInfo,
      loginEagerly,
      login,
      logout,
      logoutSilently,
      lock,
      callContract,
      onFinished,
      getSignature,
      onError,
      onCancel,
      onUnlock,
    ],
  );
}
