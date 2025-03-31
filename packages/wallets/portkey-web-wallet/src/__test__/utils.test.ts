import { zeroFill } from '../utils';
import BN from 'bn.js';

describe('zeroFill', () => {
  it('should pad string with zeros to 64 characters', () => {
    expect(zeroFill('123')).toBe(
      '000000000000000000000000000000000000000000000000000000000000007b',
    );
  });

  it('should convert BN to hex string padded to 64 characters', () => {
    const bnValue = new BN(123);
    expect(zeroFill(bnValue)).toBe(
      '000000000000000000000000000000000000000000000000000000000000007b',
    );
  });

  it('should return a 64 character string when input is already 64 characters', () => {
    const input = '0'.repeat(64);
    expect(zeroFill(input)).toBe(input);
  });
});
