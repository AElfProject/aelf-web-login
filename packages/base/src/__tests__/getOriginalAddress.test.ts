import { getOriginalAddress } from '../utils/getOriginalAddress';

describe('getOriginalAddress', () => {
  it('should return empty string for empty input', () => {
    expect(getOriginalAddress('')).toBe('');
    expect(getOriginalAddress(null as any)).toBe('');
    expect(getOriginalAddress(undefined as any)).toBe('');
  });

  it('should remove ELF_ prefix', () => {
    expect(getOriginalAddress('ELF_123456789')).toBe('123456789');
    expect(getOriginalAddress('ELF_ABC_DEF')).toBe('ABC');
  });

  it('should remove suffix after underscore', () => {
    expect(getOriginalAddress('123456789_ABC')).toBe('123456789');
    expect(getOriginalAddress('ABC_DEF_GHI')).toBe('ABC');
  });

  it('should handle both prefix and suffix removal', () => {
    expect(getOriginalAddress('ELF_123456789_ABC')).toBe('123456789');
    expect(getOriginalAddress('ELF_ABC_DEF_GHI')).toBe('ABC');
  });

  it('should return original string if no prefix or suffix', () => {
    expect(getOriginalAddress('123456789')).toBe('123456789');
    expect(getOriginalAddress('ABC')).toBe('ABC');
  });

  it('should handle multiple underscores', () => {
    expect(getOriginalAddress('ELF_A_B_C_D')).toBe('A');
    expect(getOriginalAddress('A_B_C_D')).toBe('A');
  });
});
