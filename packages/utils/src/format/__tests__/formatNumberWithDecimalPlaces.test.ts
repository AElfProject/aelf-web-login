import { formatNumberWithDecimalPlaces } from '../formatNumberWithDecimalPlaces';
import BigNumber from 'bignumber.js';

describe('formatNumberWithDecimalPlaces', () => {
  it('handles zero value', () => {
    const formatted = formatNumberWithDecimalPlaces(0);
    expect(formatted).toBe('0');
  });

  it('formats a positive number with default decimal places', () => {
    const formatted = formatNumberWithDecimalPlaces(123.4567);
    expect(formatted).toBe('123.45');
  });

  it('formats a negative number with specified decimal places', () => {
    const formatted = formatNumberWithDecimalPlaces(-123.4567, 3);
    expect(formatted).toBe('-123.456');
  });

  it('handles BigNumber input', () => {
    const bigNumberInput = new BigNumber(123.4567);
    const formatted = formatNumberWithDecimalPlaces(bigNumberInput, 1);
    expect(formatted).toBe('123.4');
  });

  it('returns the original value as string if it results in NaN', () => {
    const formatted = formatNumberWithDecimalPlaces(NaN);
    expect(formatted).toBe('NaN');
  });

  it('rounds down correctly', () => {
    const formatted = formatNumberWithDecimalPlaces(123.45678, 2);
    expect(formatted).toBe('123.45');
  });

  it('handles decimal places greater than necessary', () => {
    const formatted = formatNumberWithDecimalPlaces(123, 5);
    expect(formatted).toBe('123');
  });

  it('handles non-numeric input gracefully', () => {
    const formatted = formatNumberWithDecimalPlaces('1000');
    expect(formatted).toBe('1,000');
  });
});
