import { render, renderHook } from '@testing-library/react';
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

  it('should return store state', () => {
    const { result } = renderHook(() => useExternalStore(), {
      wrapper: ({ children }) => <WebLoginProvider config={config}>{children}</WebLoginProvider>,
    });

    expect(result.current).toBeDefined();
  });

  it('should handle hook execution', () => {
    const TestComponent = () => {
      const state = useExternalStore();
      return <div data-testid="store-state">{state ? 'State available' : 'No state'}</div>;
    };

    const { getByTestId } = render(
      <WebLoginProvider config={config}>
        <TestComponent />
      </WebLoginProvider>,
    );

    expect(getByTestId('store-state')).toBeInTheDocument();
  });
});
