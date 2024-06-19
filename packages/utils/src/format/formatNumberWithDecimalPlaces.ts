import BigNumber from 'bignumber.js';
const ZERO = new BigNumber(0);
function formatNumberWithDecimalPlaces(val: BigNumber.Value, decimal = 2) {
  const _val = ZERO.plus(val);
  if (_val.isNaN()) return `${val}`;
  return ZERO.plus(_val.toFixed(decimal, BigNumber.ROUND_DOWN)).toFormat();
}
export { formatNumberWithDecimalPlaces };
