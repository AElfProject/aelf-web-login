import { timesDecimals } from '../timesDecimals';
import BigNumber from 'bignumber.js';

describe('timesDecimals', () => {
  it('handles undefined input', () => {
    const result = timesDecimals();
    expect(result.toString()).toBe('0');
  });

  it('handles zero input', () => {
    const result = timesDecimals(0);
    expect(result.toString()).toBe('0');
  });

  it('correctly multiplies a number by default decimals (18)', () => {
    const result = timesDecimals(1);
    expect(result.toString()).toBe('1000000000000000000');
  });

  it('handles BigNumber input', () => {
    const bigNumberInput = new BigNumber(1);
    const result = timesDecimals(bigNumberInput);
    expect(result.toString()).toBe('1000000000000000000');
  });

  it('handles string decimals greater than 10', () => {
    const result = timesDecimals(1, '100000000000000000000');
    expect(result.toString()).toBe('100000000000000000000');
  });

  it('handles decimal input as a number', () => {
    const result = timesDecimals(1, 10);
    expect(result.toString()).toBe('10000000000');
  });

  it('handles invalid decimals input as a string', () => {
    const result = timesDecimals(1, 'invalid');
    expect(result.toString()).toBe('0');
  });

  it('handles NaN input', () => {
    const result = timesDecimals(NaN);
    expect(result.toString()).toBe('0');
  });

  it('handles NaN decimals input', () => {
    const result = timesDecimals(1, NaN);
    expect(result.toString()).toBe('0');
  });
});
