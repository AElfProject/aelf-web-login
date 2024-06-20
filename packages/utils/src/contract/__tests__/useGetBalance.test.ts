/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useGetBalance } from '../useGetBalance';
import { setupJestCanvasMock } from 'jest-canvas-mock';

beforeEach(() => {
  jest.clearAllMocks();
  setupJestCanvasMock();
});

jest.mock('@aelf-web-login/wallet-adapter-react', () => ({
  useConnectWallet: jest.fn(() => ({
    callViewMethod: jest.fn(),
  })),
}));

describe('useGetBalance', () => {
  it('should fetch balance and set loading state correctly', async () => {
    const { result } = renderHook(() =>
      useGetBalance({
        tokenContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
        account: 'rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk',
        symbol: 'ELF',
        chainId: 'tDVW',
      }),
    );

    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.getBalance();
    });
    expect(result.current.loading).toBe(false);
  });
});
