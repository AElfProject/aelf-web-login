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
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MSA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAuNSA2QzAuNSAyLjY4NjI5IDMuMTg2MjkgMCA2LjUgMEgzNC41QzM3LjgxMzcgMCA0MC41IDIuNjg2MjkgNDAuNSA2VjM0QzQwLjUgMzcuMzEzNyAzNy44MTM3IDQwIDM0LjUgNDBINi41QzMuMTg2MjkgNDAgMC41IDM3LjMxMzcgMC41IDM0VjZaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfNzU3NV8zMzk5KSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIxLjUyOTIgMTEuNTA0QzIzLjE1OTEgMTEuNTA0IDI0LjQ4MDQgMTAuMTgyNyAyNC40ODA0IDguNTUyOEMyNC40ODA0IDYuOTIyODggMjMuMTU5MSA1LjYwMTU2IDIxLjUyOTIgNS42MDE1NkMxOS44OTkzIDUuNjAxNTYgMTguNTc4IDYuOTIyODggMTguNTc4IDguNTUyOEMxOC41NzggMTAuMTgyNyAxOS44OTkzIDExLjUwNCAyMS41MjkyIDExLjUwNFpNMzQuODYwNSAyMC4wMDFDMzQuODYwNSAyMy4zMTcgMzIuMTcyMyAyNi4wMDUyIDI4Ljg1NjMgMjYuMDA1MkMyNS41NDAyIDI2LjAwNTIgMjIuODUyMSAyMy4zMTcgMjIuODUyMSAyMC4wMDFDMjIuODUyMSAxNi42ODQ5IDI1LjU0MDIgMTMuOTk2NyAyOC44NTYzIDEzLjk5NjdDMzIuMTcyMyAxMy45OTY3IDM0Ljg2MDUgMTYuNjg0OSAzNC44NjA1IDIwLjAwMVpNMjQuNDgwNCAzMS40NDk5QzI0LjQ4MDQgMzMuMDc5OSAyMy4xNTkxIDM0LjQwMTIgMjEuNTI5MiAzNC40MDEyQzE5Ljg5OTMgMzQuNDAxMiAxOC41NzggMzMuMDc5OSAxOC41NzggMzEuNDQ5OUMxOC41NzggMjkuODIgMTkuODk5MyAyOC40OTg3IDIxLjUyOTIgMjguNDk4N0MyMy4xNTkxIDI4LjQ5ODcgMjQuNDgwNCAyOS44MiAyNC40ODA0IDMxLjQ0OTlaTTYuNDE3MDIgMTEuNzA2OUM1LjU1MiAxMy45OTY3IDYuNzczMiAxNi41OTE3IDkuMDYyOTUgMTcuNDU2N0MxMC41ODk1IDE4LjAxNjQgMTIuMjE3NyAxNy43MTExIDEzLjM4OCAxNi43NDQ0QzE0LjQ1NjYgMTUuOTgxMSAxNS44MzA0IDE1LjcyNjcgMTcuMTUzNCAxNi4yMzU1QzE4LjAxODQgMTYuNTQwOCAxOC42Nzk5IDE3LjEwMDUgMTkuMTM3OSAxNy44MTI5TDE5LjE4ODggMTcuOTE0N0MxOS4zOTIzIDE4LjIyIDE5LjY5NzYgMTguNTI1MyAyMC4xMDQ3IDE4LjYyN0MyMS4wMjA2IDE4Ljk4MzIgMjIuMDg5MSAxOC40NzQ0IDIyLjM5NDQgMTcuNTU4NUMyMi43NTA2IDE2LjY0MjYgMjIuMjQxOCAxNS41NzQgMjEuMzI1OSAxNS4yNjg3QzIwLjkxODggMTUuMTE2MSAyMC41MTE3IDE1LjExNjEgMjAuMTA0NyAxNS4yNjg3QzE5LjI5MDUgMTUuNTIzMiAxOC4zNzQ2IDE1LjUyMzIgMTcuNTA5NiAxNS4yMTc5QzE2LjIzNzUgMTQuNzU5OSAxNS4zNzI1IDEzLjc0MjIgMTUuMDE2MyAxMi41NzE5TDE0Ljk2NTQgMTIuNDcwMUMxNC45NjU0IDEyLjQxOTMgMTQuOTY1NCAxMi4zNjg0IDE0LjkxNDUgMTIuMzY4NFYxMi4yNjY2QzE0LjU1ODQgMTAuODQxOSAxMy41OTE2IDkuNjIwNjggMTIuMTE2IDkuMTExODVDOS44MjYyMSA4LjE5NTk1IDcuMjMxMTUgOS4zNjYyNiA2LjQxNzAyIDExLjcwNjlaTTkuMDYzMzYgMjIuNTQ1QzYuNzczNiAyMy40MTAxIDUuNTUyNCAyNi4wMDUxIDYuNDE3NDIgMjguMjk0OUM3LjI4MjQ0IDMwLjYzNTUgOS44MjY2MSAzMS44MDU4IDEyLjExNjQgMzAuODg5OUMxMy41OTIgMzAuMzgxMSAxNC41NTg4IDI5LjE1OTkgMTQuOTE0OSAyNy43MzUxVjI3LjYzMzRDMTQuOTY1OCAyNy42MzM0IDE0Ljk2NTggMjcuNTgyNSAxNC45NjU4IDI3LjUzMTZMMTUuMDE2NyAyNy40Mjk4QzE1LjM3MjkgMjYuMjU5NSAxNi4yMzc5IDI1LjI0MTkgMTcuNTEgMjQuNzgzOUMxOC4zNzUgMjQuNDc4NiAxOS4yOTA5IDI0LjQ3ODYgMjAuMTA1MSAyNC43MzNDMjAuNTEyMSAyNC44ODU3IDIwLjkxOTIgMjQuODg1NyAyMS4zMjYzIDI0LjczM0MyMi4yNDIyIDI0LjQyNzcgMjIuNzUxIDIzLjM1OTIgMjIuMzk0OCAyMi40NDMzQzIyLjA4OTUgMjEuNTI3NCAyMS4wMjEgMjEuMDE4NSAyMC4xMDUxIDIxLjM3NDdDMTkuNjk4IDIxLjQ3NjUgMTkuMzkyNyAyMS43ODE4IDE5LjE4OTIgMjIuMDg3MUwxOS4xMzgzIDIyLjE4ODhDMTguNjgwMyAyMi45MDEyIDE4LjAxODggMjMuNDYwOSAxNy4xNTM4IDIzLjc2NjJDMTUuODMwOCAyNC4yNzUxIDE0LjQ1NyAyNC4wMjA3IDEzLjM4ODQgMjMuMjU3NEMxMi4yMTgxIDIyLjI5MDYgMTAuNTg5OSAyMS45ODUzIDkuMDYzMzYgMjIuNTQ1WiIgZmlsbD0id2hpdGUiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl83NTc1XzMzOTkiIHgxPSIzOS4yMjU1IiB5MT0iMC43NzYyNjQiIHgyPSIwLjUwMDAwMSIgeTI9IjM2Ljk4NDEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY3M0VDQSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1MDJFQTIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';

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
    const { isMobile } = utils;
    try {
      this._loginState = LoginStateEnum.CONNECTING;
      const nodes = this._config.nodes;
      const appName = this._config.appName;

      if (!nodes) throw makeError(ERR_CODE.WITHOUT_AELF_NODES);

      const { bridge, bridges, node } = await getBridges(nodes, appName);
      const result = await bridge.login({ chainId: node.chainId, payload: { method: 'LOGIN' } });
      if (result.error) throw result.errorMessage || result;

      if (isMobile()) {
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
      if (result.error) throw result;

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
    document.addEventListener('nightElfLockWallet', onNightElfLockWallet);
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
    const rs = contract.callSendMethod(methodName, this._wallet.address, args, sendOptions);
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
    console.log(finalChainId, bridge, '---');
    if (!bridge) {
      throw makeError(ERR_CODE.NIGHT_ELF_NOT_CONNECTED);
    }
    const contract = await this.getContract(finalChainId, contractAddress);
    const rs = contract.callViewMethod(methodName, args);
    return rs as R;
  }
}
