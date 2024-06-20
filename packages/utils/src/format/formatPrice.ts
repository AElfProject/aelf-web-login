import BigNumber from 'bignumber.js';

function formatPrice(
  price: number | BigNumber | string,
  toFixedProps?: {
    decimalPlaces?: number;
    roundingMode?: BigNumber.RoundingMode;
    minValue?: number;
  },
) {
  const {
    decimalPlaces = 2,
    roundingMode = BigNumber.ROUND_DOWN,
    minValue = 0.01,
  } = toFixedProps || {};
  const priceBig: BigNumber = BigNumber.isBigNumber(price) ? price : new BigNumber(price);
  if (priceBig.isNaN()) return `${price}`;

  if (!priceBig.isEqualTo(0) && priceBig.lt(minValue)) {
    return `< ${minValue}`;
  }

  const priceFixed = priceBig.toFixed(decimalPlaces, roundingMode);
  const res = new BigNumber(priceFixed).toFormat();
  return res;
}

export { formatPrice };
