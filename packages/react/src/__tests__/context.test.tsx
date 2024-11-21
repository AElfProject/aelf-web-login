import { render, screen } from '@testing-library/react';
import { WebLoginProvider } from '../context';
import config from '../data/config';
import { IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';

const mockBridgeAPI: IBridgeAPI = {
  getSignIn: jest.fn((children) => children),
  store: {
    getState: () => null,
    subscribe: () => null,
  },
  instance: {} as IBridgeAPI['instance'],
  mountApp: () => null,
  unMountApp: () => null,
};

jest.mock('@aelf-web-login/wallet-adapter-bridge', () => ({
  initBridge: jest.fn().mockReturnValue({
    getSignIn: jest.fn((children) => children),
  }),
}));

jest.mock('@aelf-web-login/wallet-adapter-portkey-aa', () => ({
  PortkeyAAWallet: jest.fn(),
}));

describe('WebLoginProvider', () => {
  it('should render children with provided bridgeAPI', () => {
    render(
      <WebLoginProvider bridgeAPI={mockBridgeAPI}>
        <div>Test Child</div>
      </WebLoginProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should render children with provided config', () => {
    render(
      <WebLoginProvider config={config}>
        <div>Test Child</div>
      </WebLoginProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should return null if no bridgeAPI nor config', () => {
    const { container } = render(
      <WebLoginProvider>
        <div>Test Child</div>
      </WebLoginProvider>,
    );
    expect(container.firstChild).toBeNull();
  });
});
