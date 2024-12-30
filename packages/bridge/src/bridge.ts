/* eslint-disable @typescript-eslint/no-empty-function */
import {
  TWalletInfo,
  WalletAdapter,
  ConnectedWallet,
  TWalletError,
  PORTKEYAA,
  PORTKEY_DISCOVER,
  TChainId,
  ICallContractParams,
  TSignatureParams,
  enhancedLocalStorage,
  IWalletAdapterEvents,
  utils,
  IMultiTransactionParams,
  IMultiTransactionResult,
  LoginStatusEnum,
  IS_MANAGER_READONLY,
} from '@aelf-web-login/wallet-adapter-base';
import {
  setWalletInfo,
  clearWalletInfo,
  setLocking,
  setWalletType,
  clearWalletType,
  dispatch,
  setLoginError,
  clearLoginError,
  setLoginOnChainStatus,
  store,
} from './store';
import {
  CreatePendingInfo,
  DIDWalletInfo,
  getChainInfo,
  TelegramPlatform,
  did,
} from '@portkey/did-ui-react';
import { IBaseConfig } from '.';
import { EE, SET_GUARDIAN_APPROVAL_MODAL, SET_GUARDIAN_APPROVAL_PAYLOAD } from './utils';

const { isPortkeyApp } = utils;
let isDisconnectClicked = false;
class Bridge {
  private _wallets: WalletAdapter[];
  private _activeWallet: WalletAdapter | undefined;
  private _loginResolve: (value: TWalletInfo) => void;
  private _loginReject: (error: TWalletError) => void;
  private _logoutResolve: (arg: boolean) => void;
  private _logoutReject: (arg: boolean) => void;
  private _eventMap: Record<keyof IWalletAdapterEvents, any> = {} as IWalletAdapterEvents;
  private _noCommonBaseModal: boolean;
  private _sideChainId: TChainId;

  constructor(
    wallets: WalletAdapter[],
    { sideChainId = 'tDVV', noCommonBaseModal = false }: IBaseConfig,
  ) {
    this._noCommonBaseModal = noCommonBaseModal;
    this._sideChainId = sideChainId;
    this._wallets = wallets;
    this._activeWallet = undefined;
    this._loginResolve = () => {};
    this._loginReject = () => {};
    this._logoutResolve = () => {};
    this._logoutReject = () => {};
    this._eventMap = {
      connected: this.onConnectedHandler,
      disconnected: this.onDisConnectedHandler,
      lock: this.onLockHandler,
      error: this.onConnectErrorHandler,
      loginOnChainStatusChanged: this.onLoginOnChainStatusChangedHandler,
    };
    this.bindEvents();
  }

  get loginState() {
    return this.activeWallet?.loginState;
  }

  get activeWallet() {
    try {
      if (TelegramPlatform.isTelegramPlatform()) {
        this._activeWallet = this._wallets.find((item) => item.name === PORTKEYAA);
        return this._activeWallet;
      } else if (isPortkeyApp()) {
        this._activeWallet = this._wallets.find((item) => item.name === PORTKEY_DISCOVER);
        return this._activeWallet;
      } else {
        return (
          this._activeWallet ||
          this._wallets.find((item) => item.name === enhancedLocalStorage.getItem(ConnectedWallet))
        );
      }
    } catch (e) {
      return undefined;
    }
  }

  get isAAWallet() {
    return this.activeWallet?.name === PORTKEYAA;
  }

  connect = async (): Promise<TWalletInfo> => {
    return new Promise((resolve, reject) => {
      this._loginResolve = resolve;
      this._loginReject = reject;
      if (TelegramPlatform.isTelegramPlatform()) {
        this.autoLogin();
      } else if (isPortkeyApp()) {
        console.log('begin to execute onUniqueWalletClick in PortkeyApp');
        this.onUniqueWalletClick('PortkeyDiscover');
      } else {
        this.openLoginPanel();
      }
    });
  };

  doubleCheckDisconnect = async (isForgetPin?: boolean) => {
    if (isDisconnectClicked) {
      return;
    }
    isDisconnectClicked = true;
    await this.activeWallet?.logout(isForgetPin);
    this.closeConfirmLogoutPanel();
    this.closeLockPanel();
    isDisconnectClicked = false;
    this._logoutResolve(true);
  };

  disConnect = async (isForgetPin?: boolean): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      this._logoutResolve = resolve;
      this._logoutReject = reject;

      const disConnectAsync = async () => {
        console.log('disconnect,isAAWallet:', this.isAAWallet);
        try {
          if (this.isAAWallet) {
            if (this.activeWallet!.noNeedForConfirm) {
              await this.doubleCheckDisconnect(isForgetPin);
            } else {
              this.openConfirmLogoutPanel();
            }
          } else {
            await this.activeWallet?.logout();
            this._logoutResolve(true);
          }
        } catch (e) {
          console.log(e);
          this._logoutReject(false);
        }
      };
      disConnectAsync();
    });
  };

  getAccountByChainId = async (chainId: TChainId): Promise<string> => {
    if (
      !this.activeWallet?.getAccountByChainId ||
      typeof this.activeWallet.getAccountByChainId !== 'function'
    ) {
      return '';
    }
    const account = await this.activeWallet?.getAccountByChainId(chainId);
    return account;
  };

  getWalletSyncIsCompleted = async (chainId: TChainId): Promise<string | boolean> => {
    if (
      !this.activeWallet?.getWalletSyncIsCompleted ||
      typeof this.activeWallet.getWalletSyncIsCompleted !== 'function'
    ) {
      return false;
    }
    const account = await this.activeWallet?.getWalletSyncIsCompleted(chainId);
    return account;
  };

  clearManagerReadonlyStatus = async ({
    chainIdList,
    caHash,
    guardiansApproved,
  }: {
    chainIdList: TChainId[];
    caHash: string;
    guardiansApproved?: any[];
  }) => {
    const isManagerReadOnly = enhancedLocalStorage.getItem(IS_MANAGER_READONLY) === 'true';
    if ((!guardiansApproved || guardiansApproved.length === 0) && !isManagerReadOnly) {
      console.log(
        'intg---clearManagerReadonlyStatus invoked by outer,isManagerReadOnly',
        isManagerReadOnly,
      );
      return;
    }

    try {
      await Promise.all(
        chainIdList.map(async (chainId) => {
          const chainInfo = await getChainInfo(chainId);
          const rs = await this.callSendMethod({
            chainId,
            contractAddress: chainInfo.caContractAddress,
            methodName: 'RemoveReadOnlyManager',
            args: {
              caHash,
              guardiansApproved,
            },
          });
          console.log(
            'intg---clearManagerReadonlyStatus invoked by self(callSendMethod)',
            rs,
            chainId,
          );
        }),
      );
    } catch (error) {
      console.log('intg---execute Promise.all to clearManagerReadonlyStatus error', error);
    }
  };

  callSendMethod = async <T, R>(props: ICallContractParams<T>): Promise<R> => {
    if (
      !this.activeWallet?.callSendMethod ||
      typeof this.activeWallet.callSendMethod !== 'function'
    ) {
      return null as R;
    }
    const isManagerReadOnly = enhancedLocalStorage.getItem(IS_MANAGER_READONLY) === 'true';
    console.log(this.isAAWallet, isManagerReadOnly, props.methodName);
    if (this.isAAWallet && isManagerReadOnly && props.methodName !== 'Approve') {
      EE.emit(SET_GUARDIAN_APPROVAL_MODAL, true);
      const { guardians } = await this.getApprovalModalGuardians();
      const { methodName } = props;
      const isRemoveReadOnlyManagerMethod = methodName === 'RemoveReadOnlyManager';

      const finalProps = isRemoveReadOnlyManagerMethod
        ? {
            ...props,
            args: {
              ...props.args,
              guardiansApproved: guardians,
            },
          }
        : props;

      console.log('intg---finalProps', finalProps);

      const rs = (await this.activeWallet?.callSendMethod({
        ...finalProps,
        guardiansApproved: isRemoveReadOnlyManagerMethod ? [] : guardians,
      })) as { error?: any; [key: string]: any };
      console.log('intg---rs of callSendMethod', rs);

      if (!rs.error) {
        enhancedLocalStorage.setItem(IS_MANAGER_READONLY, false);
        if (isRemoveReadOnlyManagerMethod) {
          return rs as R;
        }
        const { walletInfo } = store.getState();
        console.log(
          'intg----getApprovalModalGuardians',
          guardians,
          walletInfo?.extraInfo?.portkeyInfo?.caInfo?.caAddress,
          walletInfo?.extraInfo?.portkeyInfo?.caInfo?.caHash,
        );
        if (props.chainId === 'AELF') {
          this.clearManagerReadonlyStatus({
            chainIdList: [this._sideChainId],
            caHash: walletInfo?.extraInfo?.portkeyInfo?.caInfo?.caHash,
            guardiansApproved: guardians,
          });
        } else {
          this.clearManagerReadonlyStatus({
            chainIdList: ['AELF'],
            caHash: walletInfo?.extraInfo?.portkeyInfo?.caInfo?.caHash,
            guardiansApproved: guardians,
          });
        }
      }

      return rs as R;
    } else {
      const rs = await this.activeWallet?.callSendMethod(props);
      return rs as R;
    }
  };

  getApprovalModalGuardians = async (): Promise<{
    guardians: any[];
  }> => {
    return new Promise((resolve) => {
      EE.once(SET_GUARDIAN_APPROVAL_PAYLOAD, (result) => {
        resolve(result);
      });
    });
  };

  sendMultiTransaction = async <T>(
    params: IMultiTransactionParams<T>,
  ): Promise<IMultiTransactionResult> => {
    if (
      !this.activeWallet?.sendMultiTransaction ||
      typeof this.activeWallet.sendMultiTransaction !== 'function'
    ) {
      return null as unknown as IMultiTransactionResult;
    }
    const rs = await this.activeWallet?.sendMultiTransaction(params);
    return rs;
  };

  callViewMethod = async <T, R>(props: ICallContractParams<T>): Promise<R> => {
    if (
      !this.activeWallet?.callViewMethod ||
      typeof this.activeWallet.callViewMethod !== 'function'
    ) {
      return null as R;
    }
    const rs = await this.activeWallet?.callViewMethod(props);
    return rs as R;
  };

  getSignature = async (
    params: TSignatureParams,
  ): Promise<{
    error: number;
    errorMessage: string;
    signature: string;
    from: string;
  } | null> => {
    if (!this.activeWallet?.getSignature || typeof this.activeWallet.getSignature !== 'function') {
      return null;
    }
    try {
      const rs = await this.activeWallet?.getSignature(params);
      return rs;
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  onConnectedHandler = (walletInfo: TWalletInfo) => {
    dispatch(setWalletInfo(walletInfo));
    dispatch(setWalletType(this.activeWallet?.name));
    dispatch(clearLoginError());
  };

  onDisConnectedHandler = (isLocking = false) => {
    !isLocking && this.unbindEvents();
    isLocking && this.openLockPanel();
    this.closeNestedModal();
    dispatch(clearWalletInfo());
    dispatch(clearWalletType());
    dispatch(clearLoginError());
    dispatch(setLocking(false));
    dispatch(setLoginOnChainStatus(LoginStatusEnum.INIT));
  };

  onLockHandler = () => {
    if (TelegramPlatform.isTelegramPlatform()) {
      return;
    }
    this.openLockPanel();
    dispatch(setLocking(true));
  };

  checkLoginStatus = async () => {
    if (!this.isAAWallet) {
      return LoginStatusEnum.SUCCESS;
    }
    if (did.didWallet.isLoginStatus === LoginStatusEnum.INIT) {
      const { walletInfo } = store.getState();
      await did.didWallet.getLoginStatus({
        sessionId: did.didWallet.sessionId!,
        chainId: did.didWallet.originChainId!,
      });
      did.save(
        walletInfo?.extraInfo?.portkeyInfo?.pin,
        walletInfo?.extraInfo?.portkeyInfo?.appName,
      );
    }
    return did.didWallet.isLoginStatus;
  };

  onConnectErrorHandler = (err: TWalletError) => {
    console.log('in error event', err, this.activeWallet);
    if (!this._noCommonBaseModal) {
      this.closeLoginPanel();
      this.closeNestedModal();
    }
    this.unbindEvents();
    this.closeLoadingModal();
    this._loginReject(err);
    dispatch(clearWalletInfo());
    dispatch(clearWalletType());
    dispatch(setLoginError(err));
  };

  onLoginOnChainStatusChangedHandler = (status: LoginStatusEnum) => {
    dispatch(setLoginOnChainStatus(status));
  };

  bindEvents = () => {
    console.log('bindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    Object.entries(this._eventMap).forEach(([k, v]) => {
      this.activeWallet!.on(k as keyof IWalletAdapterEvents, v);
    });
  };

  unbindEvents = () => {
    console.log('unbindEvents', this.activeWallet);
    if (!this.activeWallet) {
      return;
    }
    Object.entries(this._eventMap).forEach(([k, v]) => {
      this.activeWallet!.off(k as keyof IWalletAdapterEvents, v);
    });
  };

  autoLogin() {}

  openLoginPanel() {}

  closeLoginPanel() {}

  openLoadingModal() {}

  closeLoadingModal() {}

  openLockPanel() {}

  closeLockPanel() {}

  openConfirmLogoutPanel() {}

  closeConfirmLogoutPanel() {}

  closeNestedModal() {}

  onUniqueWalletClick = async (name: string) => {
    try {
      this.openLoadingModal();
      this._activeWallet = this._wallets.find((ele) => ele.name === name);
      this.bindEvents();
      const walletInfo = await this._activeWallet?.login();
      this._loginResolve(walletInfo);
    } catch (e) {
      console.log('onUniqueWalletClick--', e);
    } finally {
      if (!this._noCommonBaseModal) {
        this.closeLoginPanel();
      }
      this.closeLoadingModal();
    }
  };

  onPortkeyAAWalletCreatePending = async (createPendingInfo: CreatePendingInfo) => {
    try {
      this.closeLoginPanel();
      this.openLoadingModal();
      this._activeWallet = this._wallets.find((item) => item.name === PORTKEYAA);
      if (
        !this.activeWallet?.loginWithAcceleration ||
        typeof this.activeWallet.loginWithAcceleration !== 'function'
      ) {
        return;
      }
      this.bindEvents();
      const walletInfo = await this.activeWallet.loginWithAcceleration(createPendingInfo);
      this._loginResolve(walletInfo);
    } catch (error) {
      console.log('onPortkeyAAWalletCreatePending', error);
    } finally {
      this.closeLoadingModal();
    }
  };

  onPortkeyAAWalletLoginWithAccelerationFinished = (didWalletInfo: DIDWalletInfo) => {
    try {
      if (
        !this.activeWallet?.onLoginComplete ||
        typeof this.activeWallet.onLoginComplete !== 'function'
      ) {
        return;
      }
      this.activeWallet.onLoginComplete(didWalletInfo);
    } catch (error) {
      console.log('onPortkeyAAWalletLoginWithAccelerationFinished', error);
    }
  };

  /**
   * @deprecated use onPortkeyAAWalletLoginWithAccelerationFinished
   */
  onPortkeyAAWalletLoginFinishedWithAcceleration =
    this.onPortkeyAAWalletLoginWithAccelerationFinished;

  onPortkeyAAWalletLoginFinished = async (didWalletInfo: DIDWalletInfo) => {
    try {
      this.closeLoginPanel();
      this.openLoadingModal();
      this._activeWallet = this._wallets.find((item) => item.name === PORTKEYAA);
      this.bindEvents();
      const walletInfo = await this.activeWallet?.login(didWalletInfo);
      this._loginResolve(walletInfo);
    } catch (error) {
      console.log('onPortkeyAAWalletLoginFinishedError', error);
    } finally {
      this.closeLoadingModal();
    }
  };

  onPortkeyAAUnLock = async (pin: string): Promise<TWalletInfo> => {
    try {
      setTimeout(() => {
        this.openLoadingModal();
      }, 0);
      if (!this.activeWallet?.onUnlock || typeof this.activeWallet.onUnlock !== 'function') {
        return;
      }
      const walletInfo = await this.activeWallet?.onUnlock(pin);
      console.log('onPortkeyAAUnLockSuccess----------', walletInfo);
      if (walletInfo) {
        this.closeLoginPanel();
        dispatch(setLocking(false));
        dispatch(clearLoginError());
      }

      return walletInfo;
    } catch (error) {
      console.log('onPortkeyAAUnLockFail----------');
      return;
    } finally {
      this.closeLoadingModal();
    }
  };

  lock = () => {
    if (!this.activeWallet?.lock || typeof this.activeWallet.lock !== 'function') {
      return;
    }
    if (!this.isAAWallet) {
      return;
    }
    this.activeWallet?.lock();
    dispatch(setLocking(true));
  };
}

export { Bridge };
