import { Mock } from 'vitest';
import detectWebProvider from '../detectProvider';
import detectProvider from '@portkey/detect-provider';

describe('detectWebProvider', () => {
  it('should return provider when detectProvider resolves', async () => {
    const mockProvider = { someProperty: 'someValue' };
    (detectProvider as Mock).mockResolvedValue(mockProvider);

    const result = await detectWebProvider();
    expect(result).toEqual(mockProvider);
  });

  it('should return null after 5 retries on error', async () => {
    (detectProvider as Mock).mockRejectedValue(new Error('Provider not found'));

    const result = await detectWebProvider();
    expect(result).toBeNull();
  });

  it('should retry up to 5 times on failure', async () => {
    const mockError = new Error('Provider not found');
    (detectProvider as Mock)
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({ someProperty: 'someValue' });

    const result = await detectWebProvider();
    expect(result).toEqual({ someProperty: 'someValue' });
    expect(detectProvider).toHaveBeenCalledTimes(5);
  });
});
