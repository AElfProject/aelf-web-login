import { render } from '@testing-library/react';
import useExternalStore from '../useExternalStore';
import { WebLoginProvider } from '../context';
import config from '../data/config';

const Comp = () => {
  useExternalStore();
  return null;
};
describe('useExternalStore', () => {
  it('should render hook', () => {
    render(
      <WebLoginProvider config={config}>
        <Comp />
      </WebLoginProvider>,
    );
  });
});
