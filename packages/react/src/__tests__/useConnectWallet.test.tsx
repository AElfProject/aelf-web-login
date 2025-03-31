import { render, act, renderHook } from '@testing-library/react';
import useConnectWallet from '../useConnectWallet';
import { WebLoginProvider } from '../context';
import config from '../data/config';

vi.mock('../useExternalStore', () => ({
  default: () => ({
    store: {
      getState: () => null,
      subscribe: () => null,
    },
  }),
}));

const Comp = () => {
  useConnectWallet();
  return null;
};

describe('useConnectWallet', () => {
  it('should render hook', () => {
    render(
      <WebLoginProvider config={config}>
        <Comp />
      </WebLoginProvider>,
    );
  });

  it('should connect wallet', async () => {
    const { result } = renderHook(() => useConnectWallet(), {
      wrapper: ({ children }) => <WebLoginProvider config={config}>{children}</WebLoginProvider>,
    });

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.connecting).toBe(false);
  });

  it('should disconnect wallet', async () => {
    const { result } = renderHook(() => useConnectWallet(), {
      wrapper: ({ children }) => <WebLoginProvider config={config}>{children}</WebLoginProvider>,
    });

    await act(async () => {
      await result.current.disConnectWallet();
    });

    expect(result.current.connecting).toBe(false);
  });
});
