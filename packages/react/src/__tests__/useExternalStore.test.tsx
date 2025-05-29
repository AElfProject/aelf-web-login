// @vitest-environment jsdom
// mock Modals，防止加载WalletModal和useMobile
vi.mock('../Modals', () => {
  const Modals = () => <div data-testid="modals" />;
  Modals.displayName = 'Modals';
  return { default: Modals };
});

import React from 'react';
import { renderHook } from '@testing-library/react';
import useExternalStore from '../useExternalStore';
import { useWebLoginContext } from '../context';

// Mock context
vi.mock('../context', () => ({
  useWebLoginContext: vi.fn(),
}));

const mockSubscribe = vi.fn();
const mockGetState = vi.fn();
const mockStore = {
  subscribe: mockSubscribe,
  getState: mockGetState,
};

describe('useExternalStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useWebLoginContext as any).mockReturnValue({ store: mockStore });
  });

  it('should subscribe and get state', () => {
    const onChange = vi.fn();
    mockSubscribe.mockImplementation((cb) => {
      onChange.mockImplementation(cb);
      return () => {};
    });
    mockGetState.mockReturnValue({ foo: 'bar' });

    const { result } = renderHook(() => useExternalStore());
    expect(result.current).toEqual({ foo: 'bar' });
  });

  it('should call subscribe on mount', () => {
    const unsubscribe = vi.fn();
    mockSubscribe.mockImplementation(() => unsubscribe);
    mockGetState.mockReturnValue({ foo: 'bar' });

    const { unmount } = renderHook(() => useExternalStore());
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    unmount();
  });
});
