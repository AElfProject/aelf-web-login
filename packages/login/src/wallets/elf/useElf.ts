import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { useAElfReact } from '@aelf-react/core';
import { getConfig } from '../../config';
import { CallContractParams, DoSwitchFunc, SignatureParams, SwitchWalletFunc, WalletHookInterface } from '../../types';
import { WalletHookParams } from '../types';
import { NightElfOptions } from '../../types';
import { WalletType, WebLoginState, WebLoginEvents } from '../../constants';
import checkSignatureParams from '../../utils/signatureParams';
import detectNightElf from './detectNightElf';
import { zeroFill } from '../../utils/zeroFill';
import { removeOtherKey } from '../../context';

export function useElf({
  options,
  loginState,
  eventEmitter,
  setLoading,
  setLoginError,
  setLoginState,
  setWalletType,
}: WalletHookParams<NightElfOptions>) {
  const chainId = getConfig().chainId;
  const nodes = getConfig().aelfReact.nodes;

  const timeoutLoginingRef = useRef<() => void>(() => {
    console.log('timeoutLoginingRef');
  });
  const eagerlyCheckRef = useRef(false);
  const initializingRef = useRef(false);
  const { isActive, account, pubKey, name, aelfBridges, activate, deactivate } = useAElfReact();
  const nightElfInfo = useAElfReact();
  const [switching, setSwitching] = useState(false);

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
    // setLoading(true);
    try {
      const type = await detectNightElf();

      if (type !== 'AelfBridge') {
        if (options.useMultiChain) {
          if (aelfBridges) {
            await Promise.all(
              Object.values(aelfBridges).map((bridge) => {
                return bridge.chain.getChainStatus();
              }),
            );
          }
        } else {
          await chain!.getChainStatus();
        }
      }
      setWalletType(WalletType.elf);
      setLoginState(WebLoginState.logined);
      eventEmitter.emit(WebLoginEvents.LOGINED);
    } catch (error) {
      setWalletType(WalletType.unknown);
      setLoginError(error);
      setLoginState(WebLoginState.initial);
      eventEmitter.emit(WebLoginEvents.LOGIN_ERROR, error);
    } finally {
      setLoading(false);
    }
    initializingRef.current = false;
  }, [
    setLoading,
    setWalletType,
    setLoginState,
    eventEmitter,
    options.useMultiChain,
    aelfBridges,
    chain,
    setLoginError,
  ]);

  useEffect(() => {
    if (switching) return;
    if (isActive && loginState === WebLoginState.logining) {
      initialWallet();
    }
  }, [isActive, loginState, initialWallet, switching]);

  const timeoutLogining = useCallback(() => {
    if (loginState !== WebLoginState.logining) return;
    if (!isActive) {
      console.log('cancel login: timeout');
      localStorage.removeItem('aelf-connect-eagerly');
      setLoginState(WebLoginState.initial);
      setLoading(false);
      eventEmitter.emit(WebLoginEvents.USER_CANCEL);
      eventEmitter.emit(WebLoginEvents.BRIDGE_CANCEL);
    }
  }, [eventEmitter, isActive, loginState, setLoading, setLoginState]);
  timeoutLoginingRef.current = timeoutLogining;

  const login = useCallback(
    async (options: { eagerly?: boolean } = {}) => {
      let timer;
      let isTimeout = false;
      const { eagerly } = options;
      if (!eagerly) {
        setLoading(true);
      }
      try {
        setLoginState(WebLoginState.logining);
        timer = setTimeout(() => {
          isTimeout = true;
          timeoutLoginingRef.current();
        }, 16000);
        console.log('activate');
        await activate(nodes);
        console.log('activated');
        removeOtherKey('elf' as WalletType);
      } catch (e) {
        if (isTimeout) return;
        setLoading(false);
        setLoginError(e);
        setLoginState(WebLoginState.initial);
        eventEmitter.emit(WebLoginEvents.LOGIN_ERROR, e);
      } finally {
        clearTimeout(timer as unknown as number);
      }
    },
    [activate, eventEmitter, nodes, setLoading, setLoginError, setLoginState],
  );

  const loginEagerly = useCallback(async () => {
    // setLoading(true);
    try {
      console.log('connectEagerly', loginState);
      setLoginState(WebLoginState.logining);
      const type = await detectNightElf();
      if (type === 'NightElf') {
        const instance = (window as any).NightElf || (window.parent as any).NightElf;
        const { locked } = await new instance.AElf({
          httpProvider: getConfig().defaultRpcUrl!,
        }).getExtensionInfo();
        if (locked) {
          setLoginState(WebLoginState.initial);
          return;
        }
      }
      await login({ eagerly: true });
      removeOtherKey('elf' as WalletType);
    } catch (e) {
      localStorage.removeItem('aelf-connect-eagerly');
      setLoading(false);
      setLoginError(e);
      setLoginState(WebLoginState.initial);
      eventEmitter.emit(WebLoginEvents.LOGIN_ERROR, e);
    }
  }, [eventEmitter, login, loginState, setLoading, setLoginError, setLoginState]);

  const logout = useCallback(async () => {
    setLoginState(WebLoginState.logouting);
    try {
      localStorage.removeItem('aelf-connect-eagerly');
      await deactivate();
    } catch (e) {
      console.warn(e);
    }
    setLoginState(WebLoginState.initial);
    eventEmitter.emit(WebLoginEvents.LOGOUT);
  }, [deactivate, eventEmitter, setLoginState]);

  const logoutSilently = useCallback(async () => {
    try {
      localStorage.removeItem('aelf-connect-eagerly');
      if (isActive) {
        await deactivate();
      }
    } catch (e) {
      console.warn(e);
    }
  }, [deactivate, isActive]);

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
          // logout silent
          try {
            localStorage.removeItem('aelf-connect-eagerly');
            await deactivate();
          } catch (e) {
            console.warn(e);
          } finally {
            setSwitching(false);
          }
        },
        async () => {
          setSwitching(false);
          setWalletType(WalletType.elf);
          setLoginState(WebLoginState.logined);
        },
      );
    },
    [deactivate, loginState, setLoginState, setWalletType, switching],
  );

  const callContract = useCallback(
    async function callContractFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      const _chainId = params.options?.chainId || chainId;
      if (!isActive || !account || !_chainId) {
        throw new Error('Elf not login');
      }
      const _chain = aelfBridges?.[_chainId as string]?.chain;
      // TODO: fixes cache contract
      const contract = await _chain?.contractAt(params.contractAddress, {
        address: account!,
      });
      return await contract[params.methodName](params.args);
    },
    [isActive, chain, account],
  );

  const getSignatureInMobileApp = useCallback(
    async (params: SignatureParams) => {
      if (!bridge || !isActive) {
        throw new Error('Elf not login');
      }
      if (!bridge.sendMessage) {
        throw new Error('bridge.sendMessage is not a function');
      }
      let hex = '';
      if (params.hexToBeSign) {
        hex = params.hexToBeSign!;
      } else {
        hex = params.signInfo;
      }
      const signedMsgObject = await bridge.sendMessage('keyPairUtils', {
        method: 'sign',
        arguments: [hex],
      });
      if (!signedMsgObject) {
        throw new Error('signedMsgObject is null');
      }
      if (signedMsgObject?.error) {
        throw new Error(
          signedMsgObject.errorMessage.message || signedMsgObject.errorMessage || signedMsgObject.message,
        );
      }
      const signedMsgString = [
        zeroFill(signedMsgObject.r),
        zeroFill(signedMsgObject.s),
        `0${signedMsgObject.recoveryParam.toString()}`,
      ].join('');
      return {
        error: 0,
        errorMessage: '',
        signature: signedMsgString,
        from: 'aelf-bridge',
      };
    },
    [bridge, isActive],
  );

  const getSignature = useCallback(
    async (params: SignatureParams) => {
      checkSignatureParams(params);
      if (!bridge || !isActive) {
        throw new Error('Elf not login');
      }
      if (!bridge.getSignature) {
        return await getSignatureInMobileApp(params);
      }
      let hex = '';
      if (params.hexToBeSign) {
        hex = params.hexToBeSign!;
      } else {
        hex = params.signInfo;
      }
      const signature = await bridge!.getSignature({
        address: params.address,
        hexToBeSign: hex,
      });
      return signature;
    },
    [bridge, getSignatureInMobileApp, isActive],
  );

  useEffect(() => {
    if (eagerlyCheckRef.current) {
      return;
    }
    eagerlyCheckRef.current = true;
    const canEagerly = localStorage.getItem('aelf-connect-eagerly') === 'true';
    if (canEagerly) {
      if (options.connectEagerly) {
        if (loginState === WebLoginState.initial) {
          loginEagerly();
        }
      } else {
        setLoginState(WebLoginState.eagerly);
      }
    }
  }, [loginState, loginEagerly, setLoginState, options.connectEagerly]);

  useEffect(() => {
    const onNightElfLockWallet = () => {
      logout();
    };
    document.addEventListener('nightElfLockWallet', onNightElfLockWallet);
    return document.addEventListener('nightElfLockWallet', onNightElfLockWallet);
  }, []);

  return useMemo<WalletHookInterface>(
    () => ({
      wallet: {
        name,
        address: account || '',
        publicKey: pubKey,
        nightElfInfo,
        accountInfoSync: {
          syncCompleted: loginState === WebLoginState.logined,
          holderInfo: undefined,
        },
      },
      loginEagerly,
      login,
      logout,
      switchWallet,
      loginBySwitch: login,
      logoutSilently,
      callContract,
      getSignature,
    }),
    [
      name,
      account,
      pubKey,
      nightElfInfo,
      loginState,
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
