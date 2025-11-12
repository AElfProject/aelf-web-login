import {
  BaseWalletAdapter,
  LoginStateEnum,
  TWalletInfo,
  WalletName,
  TSignatureParams,
  makeError,
  ERR_CODE,
  ConnectedWallet,
  TChainId,
  utils,
  ICallContractParams,
  enhancedLocalStorage,
} from '@aelf-web-login/wallet-adapter-base';
import { getContractBasic } from '@portkey/contracts';
import { IContract } from '@portkey/types';
import { getBridges, formatLoginInfo, detectNightElf } from './utils';
import zeroFill from './zeroFill';

type AelfNode = {
  rpcUrl: string;
  chainId: string;
};

export interface INightElfWalletAdapterConfig {
  chainId: TChainId;
  appName: string;
  connectEagerly: boolean;
  useMultiChain?: boolean;
  defaultRpcUrl: string;
  nodes?: {
    [key: string]: AelfNode;
  };
}

export const NightElfName = 'NightElf' as WalletName<'NightElf'>;

// TODO: initialWallet and setTimeout(()=>{},16000) in older version is nessary?
export class NightElfWallet extends BaseWalletAdapter {
  name = NightElfName;
  icon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjNzg1NEQxIiByeD0iOCIvPjxnIGZpbGw9IiNmZmYiPjxwYXRoIGQ9Ik0xOS41MDUgMTIuMzk0Yy0xLjk3OSAxLjU4LTIuMjc2IDQuNDk1LS42OTMgNi40NzEgMS41ODMgMS45NzYgNC41MDIgMi4yNzMgNi40OC42OTIgMS45OC0xLjU4MSAyLjI3Ni00LjQ5Ni42OTMtNi40NzItMS41ODMtMS45NzYtNC41MDItMi4yNzItNi40OC0uNjkxWk0xNS4zNSAyMy4wMTVjLS45OS43OS0xLjA4OSAyLjIyMy0uMjk3IDMuMTYyLjc5MS45ODggMi4yMjYgMS4wODcgMy4xNjYuMjk2Ljk5LS43OSAxLjA4OC0yLjIyMy4yOTYtMy4xNjItLjc0Mi0uOTg4LTIuMTc2LTEuMDg2LTMuMTY1LS4yOTZaTTE4LjIxOSA4Ljk4NWMuOTktLjc5IDEuMDg4LTIuMjIzLjI5Ni0zLjE2Mi0uNzktLjk4OC0yLjIyNi0xLjA4Ni0zLjE2NS0uMjk2LS45OS43OS0xLjA4OSAyLjIyMy0uMjk3IDMuMTYyLjc5MS45MzggMi4yMjYgMS4wODYgMy4xNjYuMjk2Wk03LjIzNyAxNC4wMjRhMy4zMzQgMy4zMzQgMCAwIDAgMy4zMTQtLjU0MyAyLjk2OCAyLjk2OCAwIDAgMSAyLjg3LS4zOTYgMy4zOSAzLjM5IDAgMCAxIDEuNTMzIDEuMTg2bC4wNS4wOTljLjE0OC4yNDcuMzk1LjQ0NC42OTIuNTQzYTEuNDMzIDEuNDMzIDAgMCAwIDEuNzgtLjc5IDEuNDMgMS40MyAwIDAgMC0uNzktMS43NzkgMS41MjcgMS41MjcgMCAwIDAtLjk0IDAgMy4wMjEgMy4wMjEgMCAwIDEtMS45OC0uMDVjLS45NC0uMzQ1LTEuNjMyLTEuMTM1LTEuOTI5LTIuMDI0bC0uMDUtLjFjMC0uMDQ5IDAtLjA0OS0uMDQ5LS4wOTh2LS4wNWEzLjM4NCAzLjM4NCAwIDAgMC0yLjEyNy0yLjQyYy0xLjc4LS42NDItMy43MS4yNDctNC40MDIgMi4wMjUtLjY0MyAxLjc3OS4yNDcgMy43NTUgMi4wMjggNC4zOTdaTTE1Ljc0NSAxOS42NTZjMC0uMDUgMC0uMDUgMCAwIC4yOTcuMDk5LjY0My4wOTkuOTQgMGExLjM1IDEuMzUgMCAwIDAgLjc5Mi0xLjc3OSAxLjM1MyAxLjM1MyAwIDAgMC0xLjc4MS0uNzkgMS4yNzkgMS4yNzkgMCAwIDAtLjY5My41NDNsLS4wNS4wOTljLS4zNDUuNTQ0LS44OS45ODgtMS41MzMgMS4xODYtLjk5LjM0Ni0yLjA3Ny4xOTctMi44NjktLjM5NS0uODktLjc0Mi0yLjEyNy0uOTQtMy4zMTQtLjU0NC0xLjc4MS42NDItMi42NzEgMi42MTgtMi4wMjggNC4zOTcuNjQzIDEuNzc4IDIuNjIxIDIuNjY3IDQuNDAyIDIuMDI1IDEuMTM4LS4zOTUgMS44OC0xLjMzNCAyLjEyNy0yLjQydi0uMDVjMC0uMDUgMC0uMDUuMDUtLjA5OWwuMDUtLjA5OWMuMjk2LS44ODkuOTQtMS42OCAxLjkyOS0yLjAyNWEyLjUwNiAyLjUwNiAwIDAgMSAxLjk3OC0uMDVaIi8+PC9nPjwvc3ZnPg==';
  private _loginState: LoginStateEnum;
  private _wallet: TWalletInfo | null;
  private _config: INightElfWalletAdapterConfig;

  constructor(config: INightElfWalletAdapterConfig) {
    super();
    this._loginState = LoginStateEnum.INITIAL;
    this._wallet = null;
    this._config = config;
    detectNightElf().then((type) => {
      if (type === 'unknown' || type === 'none') {
        return;
      }
      this.listenProviderEvents();
      this.autoRequestAccountHandler(type);
    });
  }

  get loginState() {
    return this._loginState;
  }

  get wallet() {
    return this._wallet as TWalletInfo;
  }

  async autoRequestAccountHandler(type: string) {
    const canLoginEargly = enhancedLocalStorage.getItem(ConnectedWallet);
    if (canLoginEargly !== this.name) {
      return;
    }
    if (!this._config.connectEagerly) {
      return;
    }
    await this.loginEagerly(type);
  }

  async login(): Promise<TWalletInfo> {
    const { isMobileDevices } = utils;
    try {
      this._loginState = LoginStateEnum.CONNECTING;
      const nodes = this._config.nodes;
      const appName = this._config.appName;

      if (!nodes) throw makeError(ERR_CODE.WITHOUT_AELF_NODES);

      const { bridge, bridges, node } = await getBridges(nodes, appName);
      const result = await bridge.login({ chainId: node.chainId, payload: { method: 'LOGIN' } });
      if (result.error) throw result.errorMessage || result;

      if (isMobileDevices()) {
        bridge?.connect!();
      } else {
        await Promise.all(Object.values(bridges).map((i) => i.chain.getChainStatus()));
      }

      const { account, pubKey, name, all } = formatLoginInfo(result.detail);

      this._wallet = {
        name,
        address: account,
        extraInfo: {
          publicKey: pubKey,
          nightElfInfo: {
            ...all,
            defaultAElfBridge: bridge,
            aelfBridges: bridges,
            nodes,
          },
        },
      };
      this._loginState = LoginStateEnum.CONNECTED;
      enhancedLocalStorage.setItem(ConnectedWallet, this.name);
      this.emit('connected', this._wallet);
      return this._wallet;
    } catch (error) {
      this._loginState = LoginStateEnum.INITIAL;
      this.emit('error', makeError(ERR_CODE.NIGHT_ELF_LOGIN_FAIL, error));
      return;
    }
  }

  async loginEagerly(type: string) {
    try {
      if (type === 'NightElf') {
        const instance = (window as any).NightElf || (window.parent as any).NightElf;
        const { locked } = await new instance.AElf({
          httpProvider: this._config.defaultRpcUrl!,
        }).getExtensionInfo();
        if (locked) {
          // when click 'lock' button in nightelf panel, it is triggered, just return
          console.log('night-elf-loginEagerly-locked');
          return;
        }
      }
      await this.login();
    } catch (error) {
      this.emit('error', makeError(ERR_CODE.NIGHT_ELF_LOGIN_EAGERLY_FAIL, error));
    }
  }

  async logout() {
    try {
      const address = this._wallet?.address;
      const defaultAElfBridge = this._wallet?.extraInfo?.nightElfInfo.defaultAElfBridge;
      console.log(address, defaultAElfBridge, 'defaultAElfBridge===');
      if (!address || !defaultAElfBridge) {
        throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
      }

      const result = await defaultAElfBridge.logout({ address });
      if (result?.error) throw result;

      this._wallet = null;
      this._loginState = LoginStateEnum.INITIAL;
      enhancedLocalStorage.removeItem(ConnectedWallet);
      this.emit('disconnected');
    } catch (error) {
      this.emit('error', makeError(ERR_CODE.NIGHT_ELF_LOGOUT_FAIL, error));
    }
  }

  async getSignatureInMobileApp(params: TSignatureParams) {
    if (!this._wallet) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    const bridge = this._wallet.extraInfo?.nightElfInfo?.aelfBridges?.[this._config.chainId];
    if (!bridge) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
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
        signedMsgObject.errorMessage.message ||
          signedMsgObject.errorMessage ||
          signedMsgObject.message,
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
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    const bridge = this._wallet.extraInfo?.nightElfInfo?.aelfBridges?.[this._config.chainId];
    if (!bridge) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    if (!bridge.getSignature) {
      return await this.getSignatureInMobileApp(params);
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
  }

  async getAccountByChainId(): Promise<string> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    return this._wallet?.address || '';
  }

  async getWalletSyncIsCompleted(): Promise<string> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    return this._wallet?.address || '';
  }

  private listenProviderEvents() {
    const onNightElfLockWallet = () => {
      this.logout();
    };
    if (typeof window !== 'undefined') {
      document.addEventListener('nightElfLockWallet', onNightElfLockWallet);
    }
  }

  async getContract(chainId: TChainId, contractAddress: string): Promise<IContract> {
    if (!this._wallet) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    const bridge = this._wallet.extraInfo?.nightElfInfo?.aelfBridges?.[chainId];
    if (!bridge) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }

    const chainStatus = await bridge.chain.getChainStatus();
    console.log('Before getContract, NightELF chainStatus:', chainStatus);

    return getContractBasic({
      contractAddress: contractAddress,
      aelfInstance: bridge,
      account: {
        address: this._wallet.address,
      },
    });
  }

  async callSendMethod<T, R>({
    chainId,
    contractAddress,
    methodName,
    args,
    sendOptions,
  }: ICallContractParams<T>) {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!contractAddress) {
      throw makeError(ERR_CODE.INVALID_CONTRACT_ADDRESS);
    }
    const finalChainId = chainId || this._config.chainId;
    const bridge = this._wallet.extraInfo?.nightElfInfo?.aelfBridges?.[finalChainId];
    if (!bridge) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    const contract = await this.getContract(finalChainId, contractAddress);
    const rs = contract.callSendMethod(methodName, this._wallet.address!, args, sendOptions);
    return rs as R;
  }

  async callViewMethod<T, R>({
    chainId,
    contractAddress,
    methodName,
    args,
  }: ICallContractParams<T>) {
    if (!this._wallet) {
      throw makeError(ERR_CODE.DISCOVER_NOT_CONNECTED);
    }
    if (!contractAddress) {
      throw makeError(ERR_CODE.INVALID_CONTRACT_ADDRESS);
    }
    const finalChainId = chainId || this._config.chainId;
    const bridge = this._wallet.extraInfo?.nightElfInfo?.aelfBridges?.[finalChainId];
    if (!bridge) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    const contract = await this.getContract(finalChainId, contractAddress);
    const rs = contract.callViewMethod(methodName, args);
    return rs as R;
  }
  goAssets(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
