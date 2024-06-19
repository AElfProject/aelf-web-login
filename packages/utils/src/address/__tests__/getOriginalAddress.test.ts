import { getOriginalAddress } from '../getOriginalAddress';

describe('getOriginalAddress', () => {
  it('should return "-" when address is undefined or null', () => {
    expect(getOriginalAddress(undefined as any)).toBe('-');
    expect(getOriginalAddress(null as any)).toBe('-');
  });

  it('should return "-" when address is not a string', () => {
    expect(getOriginalAddress(123 as any)).toBe('-');
  });

  it('should return the original address without prefix and suffix when it starts with "ELF_" and ends with "_" followed by characters', () => {
    const input = 'ELF_example_tDVV';
    const expectedResult = 'example';
    expect(getOriginalAddress(input)).toBe(expectedResult);
  });

  it('should return the address as is when it does not start with "ELF_"', () => {
    const input = 'example';
    expect(getOriginalAddress(input)).toBe(input);
  });

  it('should return the address without the suffix when it ends with "_" followed by characters but does not start with "ELF_"', () => {
    const input = 'example_address_123';
    const expectedResult = 'example';
    expect(getOriginalAddress(input)).toBe(expectedResult);
  });
});
