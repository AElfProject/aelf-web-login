import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { getContractBasic } from '@portkey-v1/contracts';
import { DIDWalletInfo, did } from '@portkey-v1/did-ui-react';
import { ChainId } from '@portkey-v1/types';
import { getConfig } from '../../../config';
import {
  CallContractParams,
  DoSwitchFunc,
  PortkeyInfoV1,
  SignatureParams,
  SwitchWalletFunc,
  WalletHookInterface,
} from '../../../types';
import { WalletHookParams } from '../../types';
import { PORTKEY_ORIGIN_CHAIN_ID_KEY, WalletType, WebLoginEvents, WebLoginState } from '../../../constants';
import useAccountInfoSync from '../useAccountInfoSync/indexV1';
import checkSignatureParams from '../../../utils/signatureParams';
import { PortkeyOptions } from 'src/types';
import { sendAdapter } from '../../../hooks/useCallContract';

export type PortkeyInterface = WalletHookInterface & {
  isManagerExists: boolean;
  isUnlocking: boolean;
  isPreparing: boolean;
  lock: () => void;
  onUnlock: (password: string) => Promise<boolean>;
  onError: (error: any) => void;
  onFinished: (didWalletInfo: DIDWalletInfo) => void;
  onCancel: () => void;
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
  const [didWalletInfo, setDidWalletInfo] = useState<PortkeyInfoV1>();

  const [switching, setSwitching] = useState(false);
  const [isUnlocking, setUnlocking] = useState(false);
  const [isPreparing, setPreparing] = useState(false);
  const isManagerExists = useMemo(() => {
    return loginState && !!localStorage.getItem(appName);
  }, [appName, loginState]);

  const shouldCheckAccountInfoSync =
    !!didWalletInfo && (options.checkAccountInfoSync === undefined || options.checkAccountInfoSync);
  const accountInfoSync = useAccountInfoSync(chainId, loginState, shouldCheckAccountInfoSync, didWalletInfo);

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
        await did.logout({
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
        await did.logout({
          chainId: originChainId as ChainId,
        });
      }
    } catch (e) {
      console.warn(e);
    }
  }, [appName]);

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
          setDidWalletInfo(undefined);
          setSwitching(false);
        },
        async () => {
          setSwitching(false);
          setWalletType(WalletType.portkey);
          setLoginState(WebLoginState.logined);
        },
      );
    },
    [loginState, setLoginState, setWalletType, switching],
  );

  const lock = useCallback(async () => {
    if (!didWalletInfo) {
      throw new Error(`lock on invalid didWalletInfo: ${didWalletInfo}`);
    }
    if (loginState !== WebLoginState.logined) {
      throw new Error(`lock on invalid login state: ${loginState}`);
    }
    try {
      await did.reset();
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
      const result = await sendAdapter({ caContract, didWalletInfo, params, chainId });
      return result as R;
    },
    [chainId, didWalletInfo],
  );

  const getSignature = useCallback(
    async (params: SignatureParams) => {
      checkSignatureParams(params);
      if (!didWalletInfo) {
        throw new Error('Portkey not login');
      }
      let signInfo = '';
      if (params.hexToBeSign) {
        signInfo = params.hexToBeSign;
      } else {
        signInfo = params.signInfo;
      }
      const signature = did.sign(signInfo).toString('hex');
      return {
        error: 0,
        errorMessage: '',
        signature,
        from: 'portkey',
      };
    },
    [didWalletInfo],
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

  const onUnlock = useCallback(
    async (password: string) => {
      setUnlocking(true);
      try {
        const localWallet = await did.load(password, appName);
        if (!localWallet.didWallet.accountInfo.loginAccount) {
          return Promise.resolve(false);
        }

        setLoading(true);
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

        const originChainId = localStorage.getItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
        let nickName = localWallet.didWallet.accountInfo.nickName || 'Wallet 01';
        if (originChainId) {
          try {
            const holderInfo = await did.getCAHolderInfo(originChainId as ChainId);
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

  const onFinished = useCallback(
    async (didWalletInfo: DIDWalletInfo) => {
      setPreparing(true);
      try {
        localStorage.setItem(PORTKEY_ORIGIN_CHAIN_ID_KEY, didWalletInfo.chainId);
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

        let nickName = 'Wallet 01';
        try {
          const holderInfo = await did.getCAHolderInfo(didWalletInfo.chainId);
          nickName = holderInfo.nickName;
        } catch (error) {
          console.warn(error);
        }
        try {
          await did.save(didWalletInfo.pin, appName);
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
        accountInfoSync,
      },
      loginEagerly,
      login,
      logout,
      switchWallet,
      loginBySwitch: login,
      logoutSilently,
      lock,
      callContract,
      onFinished,
      onUnlock,
      getSignature,
      onError,
      onCancel,
    }),
    [
      isManagerExists,
      isUnlocking,
      isPreparing,
      didWalletInfo,
      accountInfoSync,
      loginEagerly,
      login,
      logout,
      switchWallet,
      logoutSilently,
      lock,
      callContract,
      onFinished,
      onUnlock,
      getSignature,
      onError,
      onCancel,
    ],
  );
}
