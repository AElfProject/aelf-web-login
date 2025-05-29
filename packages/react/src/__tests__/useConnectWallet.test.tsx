// @vitest-environment jsdom
// mock Modals，防止加载WalletModal和useMobile
vi.mock('../Modals', () => {
  const Modals = () => <div data-testid="modals" />;
  Modals.displayName = 'Modals';
  return { default: Modals };
});

vi.mock('../context', () => ({
  useWebLoginContext: vi.fn(),
}));
vi.mock('../useExternalStore', () => ({
  default: vi.fn(),
}));
vi.mock('../useModal', () => ({
  useModal: vi.fn(),
}));
vi.mock('../useModal/hooks', () => ({
  useModalDispatch: vi.fn(),
}));
vi.mock('../useModal/actions', () => ({}));

import { renderHook, act } from '@testing-library/react-hooks';
import useConnectWallet from '../useConnectWallet';
import * as contextModule from '../context';
import * as useExternalStoreModule from '../useExternalStore';
import * as useModalModule from '../useModal';
import * as useModalDispatchModule from '../useModal/hooks';
import * as actionsModule from '../useModal/actions';
import {
  ConnectedWallet,
  enhancedLocalStorage,
  PORTKEY_WEB_WALLET,
} from '@aelf-web-login/wallet-adapter-base';

const mockConnect = vi.fn();
const mockDisConnect = vi.fn();
const mockLock = vi.fn();
const mockGetAccountByChainId = vi.fn();
const mockGetWalletSyncIsCompleted = vi.fn();
const mockCallSendMethod = vi.fn();
const mockCallViewMethod = vi.fn();
const mockSendMultiTransaction = vi.fn();
const mockGetSignature = vi.fn();
const mockGoAssets = vi.fn();

const instanceMock = {
  connect: mockConnect,
  disConnect: mockDisConnect,
  lock: mockLock,
  getAccountByChainId: mockGetAccountByChainId,
  getWalletSyncIsCompleted: mockGetWalletSyncIsCompleted,
  callSendMethod: mockCallSendMethod,
  callViewMethod: mockCallViewMethod,
  sendMultiTransaction: mockSendMultiTransaction,
  getSignature: mockGetSignature,
  goAssets: mockGoAssets,
  activeWallet: {},
};

describe('useConnectWallet', () => {
  let setItemSpy: ReturnType<typeof vi.spyOn>;
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let removeItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    (contextModule.useWebLoginContext as any).mockReturnValue({ instance: instanceMock });
    (useExternalStoreModule.default as any).mockReturnValue({
      walletInfo: { address: 'test' },
      isLocking: false,
      walletType: 'testType',
      loginError: null,
      loginOnChainStatus: true,
    });
    (useModalDispatchModule.useModalDispatch as any).mockReturnValue(vi.fn());
    (useModalModule.useModal as any).mockReturnValue([
      { connectInfo: null, isDisconnect: undefined },
    ]);
    (actionsModule.basicModalView as any) = {
      setWalletDialog: { actions: vi.fn() },
      setDisconnectDialogVisible: { actions: vi.fn() },
    };
    setItemSpy = vi.spyOn(enhancedLocalStorage, 'setItem');
    getItemSpy = vi.spyOn(enhancedLocalStorage, 'getItem');
    removeItemSpy = vi.spyOn(enhancedLocalStorage, 'removeItem');
  });

  afterEach(() => {
    setItemSpy?.mockRestore();
    getItemSpy?.mockRestore();
    removeItemSpy?.mockRestore();
  });

  it('should return wallet info and methods', () => {
    const { result } = renderHook(() => useConnectWallet());
    expect(result.current.walletInfo).toEqual({ address: 'test' });
    expect(result.current.isLocking).toBe(false);
    expect(result.current.walletType).toBe('testType');
    expect(result.current.loginError).toBeNull();
    expect(result.current.loginOnChainStatus).toBe(true);
    expect(typeof result.current.connectWallet).toBe('function');
    expect(typeof result.current.disConnectWallet).toBe('function');
  });

  it('should call connectWallet and connect', async () => {
    getItemSpy.mockReturnValueOnce('walletName');
    mockConnect.mockResolvedValueOnce('connected');
    const { result } = renderHook(() => useConnectWallet());
    await act(async () => {
      (useModalModule.useModal as any).mockReturnValueOnce([
        { connectInfo: { name: 'walletName' } },
      ]);
      const rs = await result.current.connectWallet();
      expect(rs).toBe('connected');
      expect(mockConnect).toHaveBeenCalledWith('walletName');
    });
  }, 100);

  it('should call disConnectWallet and disConnect', async () => {
    instanceMock.activeWallet = {};
    mockDisConnect.mockResolvedValueOnce('disconnected');
    const { result } = renderHook(() => useConnectWallet());
    await act(async () => {
      const rs = await result.current.disConnectWallet();
      expect(rs).toBe('disconnected');
      expect(mockDisConnect).toHaveBeenCalled();
    });
  });

  it('should compute isConnected correctly', () => {
    getItemSpy.mockReturnValueOnce(PORTKEY_WEB_WALLET);
    const { result } = renderHook(() => useConnectWallet());
    expect(result.current.isConnected).toBe(true);
  });

  it('should compute isConnected as false if no walletInfo and no localStorage', () => {
    getItemSpy.mockReturnValueOnce(undefined);
    (useExternalStoreModule.default as any).mockReturnValue({ walletInfo: undefined });
    const { result } = renderHook(() => useConnectWallet());
    expect(result.current.isConnected).toBe(false);
  });
});
