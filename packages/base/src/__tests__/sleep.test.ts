import { sleep } from '../utils/sleep';

describe('sleep', () => {
  it('should resolve after the specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const end = Date.now();

    // Allow for some timing variance (should be at least 100ms)
    expect(end - start).toBeGreaterThanOrEqual(95);
  });

  it('should resolve immediately for 0ms', async () => {
    const start = Date.now();
    await sleep(0);
    const end = Date.now();

    // Should resolve almost immediately
    expect(end - start).toBeLessThan(10);
  });

  it('should return a Promise', () => {
    const result = sleep(100);
    expect(result).toBeInstanceOf(Promise);
  });

  it('should handle negative values', async () => {
    const start = Date.now();
    await sleep(-100);
    const end = Date.now();

    // Should resolve almost immediately for negative values
    expect(end - start).toBeLessThan(10);
  });
});
