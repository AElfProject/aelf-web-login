import { isPrivateKey } from '../isPrivateKey';

describe('test isPrivateKey', () => {
  test('returns false when private key is invalid', () => {
    expect(isPrivateKey('111')).toBe(false);
  });
  test('returns false when private key is empty', () => {
    expect(isPrivateKey('')).toBe(false);
  });

  test('returns false when Buffer.from throw error', () => {
    const originalFrom = Buffer.from;
    jest.spyOn(Buffer, 'from').mockImplementationOnce(() => {
      throw new Error('Mocked buffer error');
    });

    const result = isPrivateKey('anyPrivateKeyHex');
    expect(result).toBe(false);

    Buffer.from = originalFrom;
  });
});
