import { render } from '@testing-library/react';
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
});
