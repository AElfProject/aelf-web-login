import { render, screen } from '@testing-library/react';
import { WebLoginProvider } from '../context';
import config from '../data/config';
import { IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';

const mockBridgeAPI: IBridgeAPI = {
  getSignIn: vi.fn((children) => children),
  store: {
    getState: () => null as unknown as ReturnType<IBridgeAPI['store']['getState']>,
    subscribe: () => null as unknown as ReturnType<IBridgeAPI['store']['subscribe']>,
  } as unknown as IBridgeAPI['store'],
  instance: {} as IBridgeAPI['instance'],
};

describe('WebLoginProvider', () => {
  it('should render children with provided bridgeAPI', () => {
    const a = render(
      // @ts-expect-error passing invalid props on purpose
      <WebLoginProvider bridgeAPI={mockBridgeAPI}>
        <div>with provided bridgeAPI</div>
      </WebLoginProvider>,
    );
    a.debug();
    expect(screen.getByText('with provided bridgeAPI')).toBeInTheDocument();
  });

  it('should render children with provided config', () => {
    render(
      <WebLoginProvider config={config}>
        <div>with provided config</div>
      </WebLoginProvider>,
    );

    expect(screen.getByText('with provided config')).toBeInTheDocument();
  });

  it('should return null if no bridgeAPI nor config', () => {
    const { container } = render(
      // @ts-expect-error passing invalid props on purpose
      <WebLoginProvider>
        <div>Test Child</div>
      </WebLoginProvider>,
    );
    expect(container.firstChild).toBeNull();
  });
});
