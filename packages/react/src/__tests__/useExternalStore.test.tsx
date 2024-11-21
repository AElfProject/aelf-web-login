import { render } from '@testing-library/react';
import useExternalStore from '../useExternalStore';
import { WebLoginProvider } from '../context';
import { IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';

jest.mock('@aelf-web-login/wallet-adapter-bridge', () => ({
  initBridge: jest.fn(),
}));

const mockBridgeAPI: Partial<IBridgeAPI> = {
  getSignIn: jest.fn((children) => children),
  store: {
    getState: () => null,
    subscribe: () => null,
  },
};

const Comp = () => {
  useExternalStore();
  return null;
};
describe('useExternalStore', () => {
  it('should render hook', () => {
    render(
      <WebLoginProvider bridgeAPI={mockBridgeAPI}>
        <Comp />
      </WebLoginProvider>,
    );
  });
});
