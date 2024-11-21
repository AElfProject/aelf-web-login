import { render } from '@testing-library/react';
import useConnectWallet from '../useConnectWallet';
import { WebLoginProvider } from '../context';
import { IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';

jest.mock('@aelf-web-login/wallet-adapter-bridge', () => ({
  initBridge: jest.fn(),
}));

const mockBridgeAPI: IBridgeAPI = {
  getSignIn: jest.fn((children) => children),
  store: {
    getState: () => null,
    subscribe: () => null,
  },
  instance: {
    connect: () => null,
  },
};

const Comp = () => {
  useConnectWallet();
  return null;
};
describe('useConnectWallet', () => {
  it('should render hook', () => {
    render(
      <WebLoginProvider bridgeAPI={mockBridgeAPI}>
        <Comp />
      </WebLoginProvider>,
    );
  });
});
