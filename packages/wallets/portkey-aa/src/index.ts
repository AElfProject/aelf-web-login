import {
  BaseWalletAdapter,
  LoginStateEnum,
  TWalletInfo,
  WalletName,
  TSignatureParams,
  PORTKEY_ORIGIN_CHAIN_ID_KEY,
  makeError,
  ERR_CODE,
  ConnectedWallet,
  TChainId,
  ICallContractParams,
  ISendOrViewAdapter,
  enhancedLocalStorage,
  IMultiTransactionParams,
  IMultiTransactionResult,
  LoginStatusEnum,
} from '@aelf-web-login/wallet-adapter-base';
import {
  did,
  DIDWalletInfo,
  managerApprove,
  getChain,
  CreatePendingInfo,
} from '@portkey/did-ui-react';
import { aes } from '@portkey/utils';
import { getContractBasic } from '@portkey/contracts';
import { IContract } from '@portkey/types';

export interface IPortkeyAAWalletAdapterConfig {
  appName: string;
  chainId: TChainId;
  autoShowUnlock: boolean;
  disconnectConfirm?: boolean;
  enableAcceleration?: boolean;
}

type TStatus = 'initial' | 'inBeforeLastGuardianApprove' | 'inCreatePending' | 'inFinish';

export const PortkeyAAName = 'PortkeyAA' as WalletName<'PortkeyAA'>;

export class PortkeyAAWallet extends BaseWalletAdapter {
  name = PortkeyAAName;
  icon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzFGMUYyMSIgZD0iTTcuNjI5IDMuMzY4Yy0xLjU3Mi42ODktMi43MSAyLjU1OS0yLjE1IDQuNjM1LjM5NCAxLjE0OCAxLjE0NSAxLjk3NiAyLjMyMyAyLjM5NSAyLjA2MS43MzEgNC4yNDgtLjkgMy45MzUtMi45OTItLjEzMy0uODktLjcwNC0xLjQ3Ny0xLjQ4Ni0xLjY5NS0uNjY4LS4xNTYtMS4zNDMtLjA0LTEuODI5LjQyNGExLjUwNCAxLjUwNCAwIDAgMC0uNDI4IDEuMzczYy4xLjMzLjI2LjUzNi42NjYuNjM0LjIyNC4wNTQuNTEgMCAuNTk4LS4yMDIuMDU5LS4xMzcuMDA0LS4yNS0uMDM3LS4zNzktLjExLS4zNTMtLjAzOC0uNTU2LjE1NC0uNzMuMjU5LS4yNTcuNjk4LS4yNi45NzYtLjA2NC4zNTkuMTgzLjY0NC43NjcuMzA4IDEuNjY0LS4zODQuOTI0LTEuMzg1IDEuMjAyLTIuMzE4Ljk2LTEuMzUtLjM1LTIuMDg1LTEuODgzLTEuNzYyLTMuMTAyLjUzOC0yLjAyOSAyLjc5OS0yLjY1NyA0LjY3OS0xLjcyNiAxLjI2OS43MTUgMi4wNjMgMS44NjcgMi4wNCAzLjQzMy0uMSAyLjU3NS0yLjcwNCA0LjQ3NC01LjMxIDMuOTc3YTUuMjc5IDUuMjc5IDAgMCAxLTQuMjItNS4wMzMgNS40MjcgNS40MjcgMCAwIDEgLjU3NC0yLjUzNkM1LjM2NCAyLjQ3NCA3LjE0IDEuNTcgOS40IDEuNDM0Yy41OTMtLjAzNSAxLjAyMyAwIDEuNzczLjA3NS0uMDMtLjAxNC0uMS0uMDQ3LS4xNzEtLjA3NGE2LjYzNSA2LjYzNSAwIDAgMC0zLjMwOS0uMzY3IDYuNjkgNi42OSAwIDAgMC0xLjkxNS41ODRjLS4yNTQuMDktLjI5Mi0uMTI2LS40ODgtLjI5LS4wOTItLjA3Ni0uMDgzLjAyLS4wODMuMDIuMDguMzgxLS4wOTcuNTczLS4xMjQuNTkyYTIuMDc5IDIuMDc5IDAgMCAxLS40ODIuMzMyYy0uMzI2LjE0Mi0uNDc4LS4wOTItLjczNy0uMjI1LS4xNzgtLjA5LS4xMDguMDYtLjEwOC4wNi4yMi40MzcuMDY2LjgzOS4wMy45MDItLjE1Mi4yMi0uMjc4LjM3NS0uNDgzLjU2LS4zNTkuMzI1LS43ODUuMDEyLS45MTItLjAzNi0uMjQtLjA4OS0uMDY3LjExNS0uMDY3LjExNS4wOTYuMTI3LjQ0Ljg1Ni4zMzMgMS4wODZhNi43MzcgNi43MzcgMCAwIDAtLjUzOSA0LjE2NWMxIDUuMDA0IDYuNjg4IDYuNzQgMTAuMjI4IDQuMzIxIDEuODc5LTEuMzg3IDIuNTItMy41NDggMi41NC00Ljg5NS4wMjItMS4zNDctLjMxNy0yLjMyNy0uOTQyLTMuMjAxLTEuNDg0LTIuMDc0LTQuMTY4LTIuNzMyLTYuMzE0LTEuNzlaIi8+PC9zdmc+';

  private _loginState: LoginStateEnum;
  private _wallet: TWalletInfo | null;
  private _config: IPortkeyAAWalletAdapterConfig;
  private _sessionId: string;
  private _status: TStatus;
  private _pin: string;

  constructor(config: IPortkeyAAWalletAdapterConfig) {
    super();
    this._loginState = LoginStateEnum.INITIAL;
    this._wallet = null;
    this._config = config;
    this._sessionId = '';
    this._pin = '';
    this._status = 'initial';
    this.autoRequestAccountHandler();
  }

  setChainId(chainId: TChainId) {
    this._config.chainId = chainId;
  }

  get loginState() {
    return this._loginState;
  }

  get disconnectConfirm() {
    return this._config.disconnectConfirm;
  }

  get wallet() {
    return this._wallet as TWalletInfo;
  }
  get appName() {
    const compatibleAppName = `V2-${this._config.appName}`;
    if (enhancedLocalStorage.getItem(compatibleAppName)) {
      return compatibleAppName;
    } else {
      return this._config.appName;
    }
  }

  async autoRequestAccountHandler() {
    const canLoginEargly =
      !!enhancedLocalStorage.getItem(this._config.appName) ||
      !!enhancedLocalStorage.getItem(`V2-${this._config.appName}`);
    if (!canLoginEargly) {
      return;
    }
    if (!this._config.autoShowUnlock) {
      return;
    }
    console.log('this._config.autoShowUnlock', this._config.autoShowUnlock);
    await this.loginEagerly();
  }

  async loginWithAcceleration(createPendingInfo: CreatePendingInfo): Promise<TWalletInfo> {
    console.log('createPendingInfo is', createPendingInfo);
    const didWallet = createPendingInfo.didWallet as DIDWalletInfo;
    this._sessionId = createPendingInfo.sessionId;
    this._status =
      createPendingInfo.sessionId === 'tmp_beforeLastGuardianApprove'
        ? 'inBeforeLastGuardianApprove'
        : 'inCreatePending';
    this._pin = createPendingInfo.pin;
    return this.login(didWallet);
  }

  async onLoginComplete(): Promise<void> {
    try {
      console.log('did.didWallet.isLoginStatus-2', did.didWallet.isLoginStatus);
      this._status = 'inFinish';
      this.emit('loginOnChainStatusChanged', did.didWallet.isLoginStatus ?? LoginStatusEnum.INIT);
    } catch (error) {
      this.emit('error', makeError(ERR_CODE.ONFINISH_IS_ERROR, error));
    }
  }
  /**
   * @deprecated use .onLoginComplete
   */
  loginCompletely = this.onLoginComplete;

  async login(didWalletInfo: DIDWalletInfo): Promise<TWalletInfo> {
    try {
      enhancedLocalStorage.setItem(PORTKEY_ORIGIN_CHAIN_ID_KEY, didWalletInfo.chainId);
      this._loginState = LoginStateEnum.CONNECTING;
      const chainId = this._config.chainId;
      const enableAcceleration = this._config.enableAcceleration;
      if (didWalletInfo.chainId !== chainId) {
        const caInfo = await did.didWallet.getHolderInfoByContract({
          caHash: didWalletInfo.caInfo?.caHash,
          chainId: chainId,
        });
        didWalletInfo.caInfo.caAddress = caInfo?.caAddress;
      }

      let nickName = 'Wallet 01';
      if (enableAcceleration && this._status !== 'inBeforeLastGuardianApprove') {
        try {
          const holderInfo = await did.getCAHolderInfo(didWalletInfo.chainId);
          nickName = holderInfo.nickName;
        } catch (error) {
          console.log(
            'portkeyAA login and execute did.getCAHolderInfo. nickName:',
            nickName,
            error,
          );
        }
      }

      try {
        await did.save(didWalletInfo.pin, this.appName);
      } catch (e) {
        console.log('portkeyAA login and execute did.save.', e);
        throw e;
      }

      const portkeyInfo = {
        ...didWalletInfo,
        accounts: {
          [chainId]: didWalletInfo.caInfo?.caAddress,
        },
        nickName,
        pin: this._pin,
        appName: this.appName,
      };

      this._wallet = {
        name: nickName,
        address: didWalletInfo.caInfo?.caAddress,
        extraInfo: {
          publicKey: didWalletInfo?.walletInfo?.keyPair?.getPublic('hex') || '',
          portkeyInfo: portkeyInfo,
        },
      };
      this._loginState = LoginStateEnum.CONNECTED;
      enhancedLocalStorage.setItem(ConnectedWallet, this.name);
      if (!this._sessionId) {
        this._status = 'inFinish';
      }
      this.emit('connected', this._wallet);
      this.emit('loginOnChainStatusChanged', did.didWallet.isLoginStatus!);
      console.log('did.didWallet.isLoginStatus-1', did.didWallet.isLoginStatus);
      return this._wallet;
    } catch (error) {
      this._loginState = LoginStateEnum.INITIAL;
      this.emit('error', makeError(ERR_CODE.PORTKEY_AA_LOGIN_FAIL, error));
      return;
    }
  }

  // TODO: will be execute emit first, then execute onLockHandler, Set a delay first and optimize later
  async loginEagerly() {
    setTimeout(() => {
      this.emit('lock');
    }, 1000);
  }

  lock() {
    if (!this._wallet) {
      throw makeError(ERR_CODE.PORTKEY_AA_NOT_CONNECTED);
    }
    did.reset();
    this._status = 'initial';
    this._wallet = null;
    this._loginState = LoginStateEnum.INITIAL;
    this.emit('disconnected', true);
  }

  async logout(isForgetPin = false) {
    try {
      const originChainId = enhancedLocalStorage.getItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
      if (!originChainId) {
        return;
      }
      console.log('isForgetPin', isForgetPin);
      if (!isForgetPin) {
        await did.logout(
          {
            chainId: originChainId as TChainId,
          },
          { onMethod: 'transactionHash' },
        );
      }

      this._wallet = null;
      this._loginState = LoginStateEnum.INITIAL;
      enhancedLocalStorage.removeItem(ConnectedWallet);
      enhancedLocalStorage.removeItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
      enhancedLocalStorage.removeItem(this.appName);

      this.emit('disconnected');
    } catch (error) {
      this.emit('error', makeError(ERR_CODE.PORTKEY_AA_LOGOUT_FAIL, error));
    }
  }

  async checkPassword(keyName: string, password: string) {
    try {
      const aesStr = await (did.didWallet as any)._storage.getItem(
        keyName || (did.didWallet as unknown as { _defaultKeyName: string })._defaultKeyName,
      );
      if (aesStr) return !!aes.decrypt(aesStr, password);
    } catch (error) {
      return false;
    }
    return false;
  }

  async onUnlock(password: string): Promise<TWalletInfo> {
    try {
      const appName = this.appName;
      const chainId = this._config.chainId;
      const isValidPinCode = await this.checkPassword(appName, password);
      if (!isValidPinCode) {
        return;
      }

      const localWallet = await did.load(password, appName);

      let caInfo = localWallet.didWallet.caInfo[chainId];
      let caHash = caInfo?.caHash;
      if (!caInfo) {
        const key = Object.keys(localWallet.didWallet.caInfo)[0];
        caHash = localWallet.didWallet.caInfo[key].caHash;
        caInfo = await did.didWallet.getHolderInfoByContract({
          caHash: caHash,
          chainId: chainId as TChainId,
        });
      }

      const originChainId = enhancedLocalStorage.getItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
      let nickName = localWallet.didWallet.accountInfo.nickName || 'Wallet 01';
      if (originChainId) {
        const holderInfo = await did.getCAHolderInfo(originChainId as TChainId);
        nickName = holderInfo.nickName;
      }

      if (did.didWallet.isLoginStatus !== LoginStatusEnum.SUCCESS) {
        if (!localWallet.didWallet.sessionId) {
          console.log('-----unlock in checkManagerIsExistByGQL');
          const result = await did.didWallet.checkManagerIsExistByGQL({
            chainId: originChainId,
            caHash,
            managementAddress: localWallet.didWallet.managementAccount?.address ?? '',
          });
          if (result) {
            await did.save(password, this.appName);
          } else {
            // logout
          }
        } else {
          const { recoveryStatus } = await did.didWallet.getLoginStatus({
            sessionId: did.didWallet.sessionId!,
            chainId: did.didWallet.originChainId!,
          });

          if (recoveryStatus === 'pass') {
            await did.save(password, this.appName);
          }
        }
      }

      console.log(
        '----unlock after checkManagerIsExistByGQL, caHash and sessionId: ',
        caHash,
        localWallet.didWallet.sessionId,
      );

      const didWalletInfo: DIDWalletInfo = {
        caInfo,
        pin: password,
        chainId: originChainId as TChainId,
        walletInfo: localWallet.didWallet.managementAccount!.wallet as any,
        accountInfo: localWallet.didWallet.accountInfo as any,
        createType: 'recovery',
      };

      const portkeyInfo = {
        ...didWalletInfo,
        accounts: {
          [chainId]: didWalletInfo.caInfo?.caAddress,
        },
        nickName,
      };

      this._wallet = {
        name: nickName,
        address: didWalletInfo.caInfo?.caAddress,
        extraInfo: {
          publicKey: didWalletInfo?.walletInfo.keyPair.getPublic('hex') || '',
          portkeyInfo: portkeyInfo,
        },
      };
      this._loginState = LoginStateEnum.CONNECTED;
      enhancedLocalStorage.setItem(ConnectedWallet, this.name);
      this._status = 'inFinish';
      this.emit('connected', this._wallet);
      console.log('----fa-sf-as-fsa-f-sa-fsa-df', did.didWallet.isLoginStatus);
      this.emit('loginOnChainStatusChanged', did.didWallet.isLoginStatus ?? LoginStatusEnum.INIT);
      return this._wallet;
    } catch (error) {
      this._loginState = LoginStateEnum.INITIAL;
      this.emit('error', makeError(ERR_CODE.PORTKEY_AA_UNLOCK_FAIL, error));
      return;
    }
  }

  async getSignature(params: TSignatureParams): Promise<{
    error: number;
    errorMessage: string;
    signature: string;
    from: string;
  }> {
    if (params.hexToBeSign) {
      console.error(
        'getSignature: hexToBeSign is deprecated, please use signInfo instead, signInfo is utf-8 string not hex',
      );
    }

    if (!this._wallet) {
      throw makeError(ERR_CODE.PORTKEY_AA_NOT_CONNECTED);
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
  }

  async getAccountByChainId(chainId: TChainId): Promise<string> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.PORTKEY_AA_NOT_CONNECTED);
    }
    const accounts = this._wallet?.extraInfo?.portkeyInfo.accounts;
    if (!accounts || !accounts[chainId]) {
      const caInfo = await did.didWallet.getHolderInfoByContract({
        caHash: this._wallet?.extraInfo?.portkeyInfo?.caInfo?.caHash,
        chainId: chainId,
      });
      return caInfo?.caAddress;
    }
    return accounts[chainId];
  }

  async getWalletSyncIsCompleted(chainId: TChainId): Promise<string | boolean> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.PORTKEY_AA_NOT_CONNECTED);
    }
    const didWalletInfo = this._wallet.extraInfo?.portkeyInfo;
    const caHash = didWalletInfo?.caInfo?.caHash;
    const address = didWalletInfo?.walletInfo?.address;
    const originChainId = didWalletInfo?.chainId;

    if (originChainId === chainId) {
      return this._wallet.address ?? false;
    }
    try {
      const holder = await did.didWallet.getHolderInfoByContract({
        chainId: chainId,
        caHash: caHash as string,
      });
      const filteredHolders = holder.managerInfos.filter((manager) => manager?.address === address);
      if (filteredHolders.length) {
        return this._wallet.address ?? false;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  private getUrl() {
    return new URL(location.href);
  }

  private getFaviconUrl(url: string, size = 50): string {
    const hostUrl = new URL(url).host;
    return `https://icon.horse/icon/${hostUrl}/${size}`;
  }

  private async sendAdapter<T>({
    caContract,
    chainId,
    contractAddress,
    methodName,
    args,
    sendOptions,
    guardiansApproved = [],
  }: ISendOrViewAdapter<T>) {
    const didWalletInfo = this._wallet!.extraInfo?.portkeyInfo;

    const chainInfo = await getChain(chainId!);
    // particular case for token contract(contractMethod: managerApprove)
    // don't deal with caContract(contractMethod: ApproveMethod)
    // if dapp provides signature, we won't awake signature pop-up again
    if ((contractAddress === chainInfo?.defaultToken.address && methodName) === 'Approve') {
      const { origin, href, hostname: name } = this.getUrl();
      const icon = this.getFaviconUrl(href);
      const originChainId = didWalletInfo.chainId;
      // use amount from result of managerApprove not from params
      // dapp user may change amount at pop-up
      const { amount, guardiansApproved, symbol } = (await managerApprove({
        originChainId,
        targetChainId: chainId,
        caHash: didWalletInfo.caInfo?.caHash,
        ...args,
        dappInfo: {
          icon,
          href: origin,
          name,
        },
      } as any)) as any;
      return caContract.callSendMethod(
        'ManagerApprove',
        '',
        {
          caHash: didWalletInfo.caInfo?.caHash,
          ...args,
          guardiansApproved,
          amount,
          symbol,
        },
        sendOptions,
      );
    } else {
      const params = {
        guardiansApproved: guardiansApproved,
        caHash: didWalletInfo.caInfo?.caHash,
        contractAddress: contractAddress,
        methodName: methodName,
        args: args,
      };
      console.log('intg----params of sendAdapter', params);
      return caContract.callSendMethod(
        'ManagerForwardCall',
        didWalletInfo.walletInfo.address,
        params,
        sendOptions,
      );
    }
  }

  async getContract(chainId: TChainId, contractAddress?: string): Promise<IContract> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.PORTKEY_AA_NOT_CONNECTED);
    }
    const chainsInfo = await did.services.getChainsInfo();
    const chainInfo = chainsInfo.find((chain) => chain.chainId === chainId);
    if (!chainInfo) {
      throw new Error(`chain is not running: ${chainId}`);
    }
    return getContractBasic({
      contractAddress: contractAddress || chainInfo.caContractAddress,
      account: this._wallet.extraInfo?.portkeyInfo.walletInfo,
      rpcUrl: chainInfo.endPoint,
    });
  }

  async callSendMethod<T, R>({
    chainId,
    contractAddress,
    methodName,
    args,
    sendOptions,
    guardiansApproved = [],
  }: ICallContractParams<T>) {
    const enableAcceleration = this._config.enableAcceleration;
    if (!this._wallet) {
      throw makeError(ERR_CODE.PORTKEY_AA_NOT_CONNECTED);
    }
    if (!contractAddress) {
      throw makeError(ERR_CODE.INVALID_CONTRACT_ADDRESS);
    }
    if (
      enableAcceleration &&
      (this._status === 'initial' || this._status === 'inBeforeLastGuardianApprove')
    ) {
      throw makeError(ERR_CODE.CANT_CALL_SEND_METHOD);
    }
    if (enableAcceleration && this._status === 'inCreatePending') {
      console.log(
        '----------in callSendMethod and _status is inCreatePending, begin to execute getLoginStatus, sessionId=',
        did.didWallet.sessionId,
      );
      const { recoveryStatus } = await did.didWallet.getLoginStatus({
        sessionId: did.didWallet.sessionId!,
        chainId: did.didWallet.originChainId!,
      });
      await did.save(this._pin, this.appName);
      console.log(
        '----------in callSendMethod and after execute getLoginStatus, recoveryStatus=',
        recoveryStatus,
      );
      if (recoveryStatus !== 'pass') {
        throw makeError(ERR_CODE.GET_LOGIN_STATUS_FAIL);
      }
    }
    console.log('...callSendMethod...did.didWallet.isLoginStatus is', did.didWallet.isLoginStatus);
    // if (this._status === 'inFinish' && did.didWallet.isLoginStatus !== 'SUCCESS') {
    //   throw makeError(ERR_CODE.IN_FINISH_BUT_STATUS_IS_NOT_SUCCESS);
    // }

    const finalChainId = chainId || this._config.chainId;
    const contract = await this.getContract(finalChainId);
    let rs;
    if (methodName === 'RemoveReadOnlyManager') {
      const didWalletInfo = this._wallet!.extraInfo?.portkeyInfo;
      console.log(
        'intg--execute RemoveReadOnlyManager,caAddress and args',
        didWalletInfo.caInfo?.caAddress,
        args,
      );
      rs = await contract.callSendMethod(
        'RemoveReadOnlyManager',
        didWalletInfo.caInfo?.caAddress,
        args,
      );
    } else {
      const adapterProps = {
        guardiansApproved,
        caContract: contract,
        chainId: finalChainId,
        contractAddress,
        methodName,
        args,
        sendOptions,
      };
      rs = await this.sendAdapter(adapterProps);
    }
    return rs as R;
  }

  async callViewMethod<T, R>({
    chainId,
    contractAddress,
    methodName,
    args,
  }: ICallContractParams<T>) {
    if (!this._wallet) {
      throw makeError(ERR_CODE.PORTKEY_AA_NOT_CONNECTED);
    }
    if (!contractAddress) {
      throw makeError(ERR_CODE.INVALID_CONTRACT_ADDRESS);
    }

    const finalChainId = chainId || this._config.chainId;
    const contract = await this.getContract(finalChainId, contractAddress);
    const rs = contract.callViewMethod(methodName, args);
    return rs as R;
  }

  async sendMultiTransaction<T>(
    params: IMultiTransactionParams<T>,
  ): Promise<IMultiTransactionResult> {
    return did.sendMultiTransaction(params);
  }
  goAssets(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
