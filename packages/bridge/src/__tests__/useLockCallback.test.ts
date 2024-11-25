import { renderHook, act } from '@testing-library/react-hooks';
import useLockCallback from '../useLockCallback';

describe('useLockCallback Hook', () => {
  it('should execute function and lock', async () => {
    const mockFn = jest.fn(async () => {
      await new Promise((res) => setTimeout(res, 100));
      return 'result';
    });

    const { result } = renderHook(() => useLockCallback(mockFn, []));

    // First call should execute
    let value;
    await act(async () => {
      value = await result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(value).toBe('result');
  });

  it('should prevent concurrent execution', async () => {
    const mockFn = jest.fn(async () => {
      await new Promise((res) => setTimeout(res, 100));
    });

    const { result } = renderHook(() => useLockCallback(mockFn, []));

    // First call will run
    let firstCall;
    await act(async () => {
      firstCall = result.current();
      await result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(1); // Should only run once

    await firstCall; // Resolve first call
  });

  it('should allow another execution after previous is finished', async () => {
    const mockFn = jest.fn(async () => {
      await new Promise((res) => setTimeout(res, 100));
      return 'success';
    });

    const { result } = renderHook(() => useLockCallback(mockFn, []));

    // First call
    let firstResult;
    await act(async () => {
      firstResult = await result.current();
    });

    expect(firstResult).toBe('success');

    // Second call, after first one has finished
    let secondResult;
    await act(async () => {
      secondResult = await result.current();
    });

    expect(secondResult).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2); // Second call should now be allowed
  });

  it('should release the lock if the callback throws an error', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Test error');
    });

    const { result } = renderHook(() => useLockCallback(mockFn, []));

    const lockedCallback = result.current;

    // First call should execute
    const firstPromise = lockedCallback();
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Expect the first call to throw an error
    await expect(firstPromise).rejects.toThrow('Test error');

    // Second call should now execute
    const secondPromise = lockedCallback();
    await expect(secondPromise).rejects.toThrow('Test error');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
