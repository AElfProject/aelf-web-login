import BigNumber from 'bignumber.js';

export function timesDecimals(a?: BigNumber.Value, decimals: string | number = 18) {
  if (!a) return new BigNumber(0);
  const bigA = BigNumber.isBigNumber(a) ? a : new BigNumber(a);
  if (bigA.isNaN() || isNaN(Number(decimals))) return new BigNumber(0);
  if (typeof decimals === 'string' && decimals.length > 10) {
    return bigA.times(decimals);
  }
  return bigA.times(`1e${decimals}`);
}
