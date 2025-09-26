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
    vi.spyOn(Buffer, 'from').mockImplementationOnce(() => {
      throw new Error('Mocked buffer error');
    });

    const result = isPrivateKey('anyPrivateKeyHex');
    expect(result).toBe(false);

    Buffer.from = originalFrom;
  });

  test('returns false when private key is null', () => {
    expect(isPrivateKey(null as any)).toBe(false);
  });

  test('returns false when private key is undefined', () => {
    expect(isPrivateKey(undefined as any)).toBe(false);
  });

  test('returns false when private key is not a string', () => {
    expect(isPrivateKey(123 as any)).toBe(false);
  });

  test('returns false when private key is too short', () => {
    expect(isPrivateKey('1234567890abcdef')).toBe(false);
  });

  test('returns false when private key is too long', () => {
    expect(
      isPrivateKey(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      ),
    ).toBe(false);
  });

  test('returns true when private key is valid 32-byte hex', () => {
    expect(isPrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(
      true,
    );
  });
});
