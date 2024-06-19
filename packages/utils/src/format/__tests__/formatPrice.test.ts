import { formatPrice } from '../formatPrice';
import BigNumber from 'bignumber.js';

describe('formatPrice', () => {
  it('handles number input with default parameters', () => {
    const formatted = formatPrice(123.4567);
    expect(formatted).toBe('123.45');
  });

  it('formats BigNumber input with custom decimal places', () => {
    const formatted = formatPrice(new BigNumber(123.4567), { decimalPlaces: 3 });
    expect(formatted).toBe('123.456');
  });

  it('uses ROUND_DOWN rounding mode by default', () => {
    const formatted = formatPrice(123.4567, { decimalPlaces: 1 });
    expect(formatted).toBe('123.4');
  });

  it('applies custom rounding mode', () => {
    const formatted = formatPrice(123.4567, { decimalPlaces: 1, roundingMode: BigNumber.ROUND_UP });
    expect(formatted).toBe('123.5');
  });

  it('handles minValue constraint', () => {
    const formatted = formatPrice(0.009, { minValue: 0.01 });
    expect(formatted).toBe('< 0.01');
  });

  it('returns string representation of original value if it results in NaN', () => {
    const formatted = formatPrice(NaN);
    expect(formatted).toBe('NaN');
  });

  it('handles string input correctly', () => {
    const formatted = formatPrice('123.456');
    expect(formatted).toBe('123.45');
  });

  it('respects all provided formatting options', () => {
    const formatted = formatPrice(123.4567, {
      decimalPlaces: 1,
      roundingMode: BigNumber.ROUND_UP,
      minValue: 0.05,
    });
    expect(formatted).toBe('123.5');
  });
});
