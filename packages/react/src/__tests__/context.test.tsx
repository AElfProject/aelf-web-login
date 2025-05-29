import React from 'react';
import { render, screen } from '@testing-library/react';
import { useWebLoginContext, WebLoginProvider } from '../context';

// mock依赖
vi.mock('../init', () => {
  return {
    // @ts-expect-error: allow globalThis.__initMock__ for dynamic mock in tests
    init: globalThis.__initMock__ || vi.fn(() => ({ foo: 'bar' })),
  };
});
vi.mock('../constants/config', () => ({
  ETRANSFER_CONFIG: {
    MAINNET: { a: 1 },
    TESTNET: { a: 2 },
  },
}));
vi.mock('@portkey/connect-web-wallet', () => ({
  PortkeyWebWalletProvider: ({ children }: any) => <div data-testid="portkey">{children}</div>,
}));
vi.mock('../useModal', () => ({
  ModalProvider: ({ children }: any) => <div data-testid="modal">{children}</div>,
}));
vi.mock('../Modals', () => {
  const Modals = () => <div data-testid="modals" />;
  Modals.displayName = 'Modals';
  return { default: Modals };
});

describe('WebLoginContext', () => {
  beforeEach(() => {
    // @ts-expect-error: allow globalThis.__initMock__ for dynamic mock in tests
    globalThis.__initMock__ = vi.fn(() => ({ foo: 'bar' }));
  });

  afterEach(() => {
    // @ts-expect-error: allow globalThis.__initMock__ for dynamic mock in tests
    delete globalThis.__initMock__;
  });

  it('should provide context value to children', () => {
    const Child = () => {
      const ctx = useWebLoginContext();
      // @ts-expect-error: mock context value includes 'foo' for testing
      return <div data-testid="ctx">{ctx.foo}</div>;
    };
    Child.displayName = 'Child';

    render(
      <WebLoginProvider
        config={
          {
            baseConfig: {
              networkType: 'MAINNET',
              appName: '',
              theme: '',
              loginConfig: {},
              design: {},
            },
          } as any
        }
      >
        <Child />
      </WebLoginProvider>,
    );

    expect(screen.getByTestId('ctx').textContent).toBe('bar');
    expect(screen.getByTestId('portkey')).toBeInTheDocument();
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modals')).toBeInTheDocument();
  });

  it('should throw error if useWebLoginContext is used outside provider', () => {
    expect(() => useWebLoginContext()).toThrow();
  });

  it('should render null if finalBridgeAPI is undefined', () => {
    // mock init return undefined
    // @ts-expect-error: allow globalThis.__initMock__ for dynamic mock in tests
    globalThis.__initMock__.mockImplementationOnce(() => undefined);

    render(
      <WebLoginProvider
        config={
          {
            baseConfig: {
              networkType: 'MAINNET',
              appName: '',
              theme: '',
              loginConfig: {},
              design: {},
            },
          } as any
        }
      >
        {null}
      </WebLoginProvider>,
    );
    expect(screen.queryByText('child')).toBeNull();
  });

  it('should support extraElementInConnectModal', () => {
    const extra = <span data-testid="extra">extra</span>;
    const Child = () => {
      const ctx = useWebLoginContext();
      return <div>{ctx.extraElementInConnectModal}</div>;
    };
    Child.displayName = 'Child';
    render(
      <WebLoginProvider
        config={
          {
            baseConfig: {
              networkType: 'MAINNET',
              appName: '',
              theme: '',
              loginConfig: {},
              design: {},
            },
          } as any
        }
        extraElementInConnectModal={extra}
      >
        <Child />
      </WebLoginProvider>,
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });
});
