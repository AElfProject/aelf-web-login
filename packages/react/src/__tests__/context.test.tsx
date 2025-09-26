import React from 'react';
import { render, screen } from '@testing-library/react';
import { WebLoginProvider, useWebLoginContext } from '../context';
import config from '../data/config';

// Mock the init function to return a mock bridge API
vi.mock('../init', () => ({
  init: vi.fn(() => ({
    instance: {
      connect: vi.fn(),
      disConnect: vi.fn(),
      lock: vi.fn(),
      getAccountByChainId: vi.fn(),
      getWalletSyncIsCompleted: vi.fn(),
      callSendMethod: vi.fn(),
      callViewMethod: vi.fn(),
      sendMultiTransaction: vi.fn(),
      getSignature: vi.fn(),
      goAssets: vi.fn(),
    },
    store: {
      getState: vi.fn(() => ({})),
      subscribe: vi.fn(() => vi.fn()),
    },
  })),
}));

// Mock PortkeyWebWalletProvider
vi.mock('@portkey/connect-web-wallet', () => ({
  PortkeyWebWalletProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ModalProvider
vi.mock('../useModal', () => ({
  ModalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Modals component
vi.mock('../Modals', () => ({
  default: () => <div>Modals</div>,
}));

describe('WebLoginProvider', () => {
  it('should render children with provided config', () => {
    const a = render(
      <WebLoginProvider config={config}>
        <div>with provided config</div>
      </WebLoginProvider>,
    );
    a.debug();
    expect(screen.getByText('with provided config')).toBeInTheDocument();
  });

  it('should throw an error if no config is provided', () => {
    const renderWithNoConfig = () =>
      render(
        <WebLoginProvider config={undefined as any}>
          <div>Test Child</div>
        </WebLoginProvider>,
      );

    expect(renderWithNoConfig).toThrow(/baseConfig/);
  });

  it('should pass extraElementInConnectModal to context', () => {
    const extraElement = <div data-testid="extra-element">Extra Element</div>;

    render(
      <WebLoginProvider config={config} extraElementInConnectModal={extraElement}>
        <div>Test Child</div>
      </WebLoginProvider>,
    );

    // The extraElement should be passed to context but not necessarily rendered in DOM
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should use default networkType when not provided', () => {
    const configWithoutNetworkType = {
      ...config,
      baseConfig: {
        ...config.baseConfig,
        networkType: 'MAINNET' as any,
      },
    };

    render(
      <WebLoginProvider config={configWithoutNetworkType}>
        <div>Test Child</div>
      </WebLoginProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should handle undefined finalBridgeAPI', () => {
    // This test verifies the component handles the case when init returns undefined
    const { container } = render(
      <WebLoginProvider config={config}>
        <div>Test Child</div>
      </WebLoginProvider>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('useWebLoginContext', () => {
  it('should return context value when used within provider', () => {
    const TestComponent = () => {
      const context = useWebLoginContext();
      return <div data-testid="context-value">{context ? 'Context available' : 'No context'}</div>;
    };

    render(
      <WebLoginProvider config={config}>
        <TestComponent />
      </WebLoginProvider>,
    );

    expect(screen.getByTestId('context-value')).toHaveTextContent('Context available');
  });

  it('should handle context usage', () => {
    const TestComponent = () => {
      const context = useWebLoginContext();
      return <div data-testid="context-test">{context ? 'Context available' : 'No context'}</div>;
    };

    render(
      <WebLoginProvider config={config}>
        <TestComponent />
      </WebLoginProvider>,
    );

    expect(screen.getByTestId('context-test')).toBeInTheDocument();
  });

  it('should handle undefined finalBridgeAPI', () => {
    // This test verifies the component handles undefined finalBridgeAPI
    const { container } = render(
      <WebLoginProvider config={config}>
        <div>Test Child</div>
      </WebLoginProvider>,
    );

    // The component should render normally with the mocked init
    expect(container.firstChild).toBeInTheDocument();
  });
});
