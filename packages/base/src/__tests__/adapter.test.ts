import { EventEmitter } from 'eventemitter3';
import {
  WalletName,
  IWalletAdapterEvents,
  IWalletAdapter,
  WalletAdapter,
  BaseWalletAdapter,
} from '../adapter';
import {
  TWalletInfo,
  TChainId,
  TSignatureParams,
  ICallContractParams,
  LoginStateEnum,
} from '../types';

describe('adapter', () => {
  describe('WalletName type', () => {
    it('should create branded string type', () => {
      const walletName: WalletName<'TestWallet'> = 'TestWallet' as WalletName<'TestWallet'>;
      expect(walletName).toBe('TestWallet');
    });
  });

  describe('IWalletAdapterEvents interface', () => {
    it('should define event method signatures', () => {
      const events: IWalletAdapterEvents = {
        connected: (walletInfo: TWalletInfo) => {},
        disconnected: (isLocking?: boolean) => {},
        lock: () => {},
        error: (error: any) => {},
        loginOnChainStatusChanged: (status: any) => {},
      };

      expect(typeof events.connected).toBe('function');
      expect(typeof events.disconnected).toBe('function');
      expect(typeof events.lock).toBe('function');
      expect(typeof events.error).toBe('function');
      expect(typeof events.loginOnChainStatusChanged).toBe('function');
    });
  });

  describe('IWalletAdapter interface', () => {
    it('should define required properties and methods', () => {
      const adapter: IWalletAdapter<'TestWallet'> = {
        name: 'TestWallet' as WalletName<'TestWallet'>,
        icon: 'test-icon',
        loginState: LoginStateEnum.INITIAL,
        wallet: undefined,
        disconnectConfirm: false,
        login: async (arg?: any) => ({}) as TWalletInfo,
        logout: async (isForgetPin?: boolean) => {},
        loginEagerly: async (type?: string) => {},
        getSignature: async (params: TSignatureParams) => ({
          error: 0,
          errorMessage: '',
          signature: '',
          from: '',
        }),
        getAccountByChainId: async (chainId: TChainId) => '',
        getWalletSyncIsCompleted: async (chainId: TChainId) => true,
        callSendMethod: async <T, R>(props: ICallContractParams<T>) => ({}) as R,
        callViewMethod: async <T, R>(props: ICallContractParams<T>) => ({}) as R,
        goAssets: async () => {},
      };

      expect(adapter.name).toBe('TestWallet');
      expect(adapter.icon).toBe('test-icon');
      expect(adapter.loginState).toBe(LoginStateEnum.INITIAL);
      expect(typeof adapter.login).toBe('function');
      expect(typeof adapter.logout).toBe('function');
      expect(typeof adapter.getSignature).toBe('function');
    });
  });

  describe('WalletAdapter type', () => {
    it('should combine IWalletAdapter with EventEmitter', () => {
      class TestWalletAdapter
        extends EventEmitter<IWalletAdapterEvents>
        implements IWalletAdapter<'TestWallet'>
      {
        name = 'TestWallet' as WalletName<'TestWallet'>;
        icon = 'test-icon';
        loginState = LoginStateEnum.INITIAL;
        wallet = undefined;
        disconnectConfirm = false;

        async login(arg?: any): Promise<TWalletInfo> {
          return {} as TWalletInfo;
        }

        async logout(isForgetPin?: boolean): Promise<void> {}

        async loginEagerly(type?: string): Promise<void> {}

        async getSignature(params: TSignatureParams): Promise<{
          error: number;
          errorMessage: string;
          signature: string;
          from: string;
        }> {
          return {
            error: 0,
            errorMessage: '',
            signature: '',
            from: '',
          };
        }

        async getAccountByChainId(chainId: TChainId): Promise<string> {
          return '';
        }

        async getWalletSyncIsCompleted(chainId: TChainId): Promise<string | boolean> {
          return true;
        }

        async callSendMethod<T, R>(props: ICallContractParams<T>): Promise<R> {
          return {} as R;
        }

        async callViewMethod<T, R>(props: ICallContractParams<T>): Promise<R> {
          return {} as R;
        }

        async goAssets(): Promise<void> {}
      }

      const adapter: WalletAdapter<'TestWallet'> = new TestWalletAdapter();
      expect(adapter.name).toBe('TestWallet');
      expect(adapter.icon).toBe('test-icon');
      expect(adapter.loginState).toBe(LoginStateEnum.INITIAL);
    });
  });

  describe('BaseWalletAdapter abstract class', () => {
    it('should define abstract properties and methods', () => {
      class TestBaseWalletAdapter extends BaseWalletAdapter<'TestWallet'> {
        name = 'TestWallet' as WalletName<'TestWallet'>;
        icon = 'test-icon';
        loginState = LoginStateEnum.INITIAL;
        wallet = undefined;

        async login(arg?: any): Promise<TWalletInfo> {
          return {} as TWalletInfo;
        }

        async logout(isForgetPin?: boolean): Promise<void> {}

        async loginEagerly(type?: string): Promise<void> {}

        async getSignature(params: TSignatureParams): Promise<{
          error: number;
          errorMessage: string;
          signature: string;
          from: string;
        }> {
          return {
            error: 0,
            errorMessage: '',
            signature: '',
            from: '',
          };
        }

        async getAccountByChainId(chainId: TChainId): Promise<string> {
          return '';
        }

        async getWalletSyncIsCompleted(chainId: TChainId): Promise<string | boolean> {
          return true;
        }

        async callSendMethod<T, R>(props: ICallContractParams<T>): Promise<R> {
          return {} as R;
        }

        async callViewMethod<T, R>(props: ICallContractParams<T>): Promise<R> {
          return {} as R;
        }

        async goAssets(): Promise<void> {}
      }

      const adapter = new TestBaseWalletAdapter();
      expect(adapter.name).toBe('TestWallet');
      expect(adapter.icon).toBe('test-icon');
      expect(adapter.loginState).toBe(LoginStateEnum.INITIAL);
      expect(typeof adapter.login).toBe('function');
      expect(typeof adapter.logout).toBe('function');
      expect(typeof adapter.getSignature).toBe('function');
    });
  });

  describe('EventEmitter export', () => {
    it('should export EventEmitter from eventemitter3', () => {
      expect(EventEmitter).toBeDefined();
      expect(typeof EventEmitter).toBe('function');
    });
  });
});
