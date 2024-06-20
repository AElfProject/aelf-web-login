import { divDecimals } from '../divDecimals';
import BigNumber from 'bignumber.js';

describe('divDecimals', () => {
  it('handles undefined input', () => {
    const result = divDecimals();
    expect(result.toString()).toBe('0');
  });

  it('handles zero input', () => {
    const result = divDecimals(0);
    expect(result.toString()).toBe('0');
  });

  it('correctly divides a number by default decimals (18)', () => {
    const result = divDecimals(1e18);
    expect(result.toString()).toBe('1');
  });

  it('handles BigNumber input', () => {
    const bigNumberInput = new BigNumber(1e18);
    const result = divDecimals(bigNumberInput);
    expect(result.toString()).toBe('1');
  });

  it('handles string decimals greater than 10', () => {
    const result = divDecimals(1e18, '100000000000000000000');
    expect(result.toString()).toBe('0.01');
  });

  it('handles decimal input as a number', () => {
    const result = divDecimals(1e18, 10);
    expect(result.toString()).toBe('100000000');
  });

  it('handles invalid decimals input as a string', () => {
    const result = divDecimals(1e18, 'invalid');
    expect(result.toString()).toBe('0');
  });

  it('handles NaN input', () => {
    const result = divDecimals(NaN);
    expect(result.toString()).toBe('0');
  });
});
