import { addPrefixSuffix } from '../addPrefixSuffix';

describe('addPrefixSuffix', () => {
  it('should add default prefix and suffix when only string is provided', () => {
    const result = addPrefixSuffix('xxxxxxx');
    expect(result).toBe('ELF_xxxxxxx_tDVW');
  });

  it('should add custom prefix and suffix', () => {
    const result = addPrefixSuffix('customString', 'CST');
    expect(result).toBe('ELF_customString_CST');
  });

  it('should handle empty string input', () => {
    const result = addPrefixSuffix('');
    expect(result).toBe('');
  });

  it('should handle undefined chainId', () => {
    const result = addPrefixSuffix('anotherTest');
    expect(result).toBe('ELF_anotherTest_tDVW');
  });

  it('should ignore null chainId and use default', () => {
    const result = addPrefixSuffix('ignoreNull', null as any);
    expect(result).toBe('ELF_ignoreNull_tDVW');
  });
});
