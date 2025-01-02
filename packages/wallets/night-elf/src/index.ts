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
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0ibm9uZSI+PGcgY2xpcC1wYXRoPSJ1cmwoI2EpIj48cGF0aCBmaWxsPSIjMUYxRjIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04LjUyNiAzLjY4YTEuNTA3IDEuNTA3IDAgMSAwIDAtMy4wMTMgMS41MDcgMS41MDcgMCAwIDAgMCAzLjAxNFptNi44MDggNC4zNGEzLjA2NiAzLjA2NiAwIDEgMS02LjEzMiAwIDMuMDY2IDMuMDY2IDAgMCAxIDYuMTMyIDBabS01LjMgNS44NDVhMS41MDcgMS41MDcgMCAxIDEtMy4wMTQgMCAxLjUwNyAxLjUwNyAwIDAgMSAzLjAxNCAwWk0uODA5IDMuNzg1Qy4zNjggNC45NTQuOTkxIDYuMjc5IDIuMTYgNi43MmMuNzguMjg2IDEuNjExLjEzIDIuMjA5LS4zNjRhMi4wMjIgMi4wMjIgMCAwIDEgMS45MjMtLjI2Yy40NDEuMTU2Ljc4LjQ0MiAxLjAxMy44MDZsLjAyNi4wNTJjLjEwNC4xNTYuMjYuMzExLjQ2OC4zNjNhLjkwNS45MDUgMCAwIDAgMS4xNjktLjU0NS45MDUuOTA1IDAgMCAwLS41NDYtMS4xNy44Ni44NiAwIDAgMC0uNjIzIDBjLS40MTYuMTMtLjg4NC4xMy0xLjMyNS0uMDI1QTIuMDU3IDIuMDU3IDAgMCAxIDUuMiA0LjIyNmwtLjAyNi0uMDUyYzAtLjAyNiAwLS4wNTEtLjAyNS0uMDUxVjQuMDdjLS4xODItLjcyOC0uNjc2LTEuMzUyLTEuNDMtMS42MTFBMi4yMSAyLjIxIDAgMCAwIC44MSAzLjc4NVpNMi4xNiA5LjMxOUMuOTkxIDkuNzYuMzY4IDExLjA4Ni44MSAxMi4yNTVjLjQ0MSAxLjE5NSAxLjc0IDEuNzkzIDIuOTEgMS4zMjUuNzUzLS4yNiAxLjI0Ny0uODgzIDEuNDI5LTEuNjExdi0uMDUyYy4wMjYgMCAuMDI2LS4wMjYuMDI2LS4wNTJsLjAyNS0uMDUyQTIuMDU3IDIuMDU3IDAgMCAxIDcuOCAxMC40MzZhLjg2Ljg2IDAgMCAwIC42MjMgMCAuOTA1LjkwNSAwIDAgMCAuNTQ2LTEuMTcuOTA1LjkwNSAwIDAgMC0xLjE3LS41NDVjLS4yMDcuMDUyLS4zNjMuMjA4LS40NjcuMzY0bC0uMDI2LjA1MmMtLjIzNC4zNjQtLjU3Mi42NS0xLjAxMy44MDUtLjY3Ni4yNi0xLjM3Ny4xMy0xLjkyMy0uMjZBMi4yNCAyLjI0IDAgMCAwIDIuMTYgOS4zMloiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjwvZz48ZGVmcz48Y2xpcFBhdGggaWQ9ImEiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoMTZ2MTZIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L3N2Zz4=';
  darkIcon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0ibm9uZSI+PGcgY2xpcC1wYXRoPSJ1cmwoI2EpIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04LjUyNiAzLjY4YTEuNTA3IDEuNTA3IDAgMSAwIDAtMy4wMTMgMS41MDcgMS41MDcgMCAwIDAgMCAzLjAxNFptNi44MDcgNC4zNGEzLjA2NiAzLjA2NiAwIDEgMS02LjEzMiAwIDMuMDY2IDMuMDY2IDAgMCAxIDYuMTMyIDBabS01LjMgNS44NDVhMS41MDcgMS41MDcgMCAxIDEtMy4wMTQgMCAxLjUwNyAxLjUwNyAwIDAgMSAzLjAxNCAwWk0uODEgMy43ODVDLjM2NyA0Ljk1NC45OSA2LjI3OSAyLjE2IDYuNzJjLjc4LjI4NiAxLjYxLjEzIDIuMjA5LS4zNjRhMi4wMjIgMi4wMjIgMCAwIDEgMS45MjItLjI2Yy40NDIuMTU2Ljc4LjQ0MiAxLjAxNC44MDZsLjAyNi4wNTJjLjEwNC4xNTYuMjYuMzExLjQ2Ny4zNjNhLjkwNS45MDUgMCAwIDAgMS4xNy0uNTQ1LjkwNS45MDUgMCAwIDAtLjU0Ni0xLjE3Ljg2Ljg2IDAgMCAwLS42MjQgMGMtLjQxNS4xMy0uODgzLjEzLTEuMzI1LS4wMjVBMi4wNTcgMi4wNTcgMCAwIDEgNS4yIDQuMjI2bC0uMDI2LS4wNTJjMC0uMDI2IDAtLjA1MS0uMDI2LS4wNTFWNC4wN2MtLjE4Mi0uNzI4LS42NzYtMS4zNTItMS40MjktMS42MTFhMi4yMSAyLjIxIDAgMCAwLTIuOTEgMS4zMjVaTTIuMTYgOS4zMTlDLjk5IDkuNzYuMzY3IDExLjA4Ni44MDkgMTIuMjU1Yy40NDIgMS4xOTUgMS43NCAxLjc5MyAyLjkxIDEuMzI1Ljc1My0uMjYgMS4yNDctLjg4MyAxLjQyOS0xLjYxMXYtLjA1MmMuMDI2IDAgLjAyNi0uMDI2LjAyNi0uMDUybC4wMjYtLjA1MmEyLjA1NyAyLjA1NyAwIDAgMSAyLjU5OC0xLjM3Ny44Ni44NiAwIDAgMCAuNjI0IDAgLjkwNS45MDUgMCAwIDAgLjU0Ni0xLjE3LjkwNS45MDUgMCAwIDAtMS4xNy0uNTQ1Yy0uMjA4LjA1Mi0uMzYzLjIwOC0uNDY3LjM2NGwtLjAyNi4wNTJjLS4yMzQuMzY0LS41NzIuNjUtMS4wMTQuODA1LS42NzUuMjYtMS4zNzcuMTMtMS45MjItLjI2QTIuMjQgMi4yNCAwIDAgMCAyLjE2IDkuMzJaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGRlZnM+PGNsaXBQYXRoIGlkPSJhIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDE2djE2SDB6Ii8+PC9jbGlwUGF0aD48L2RlZnM+PC9zdmc+';
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
}
