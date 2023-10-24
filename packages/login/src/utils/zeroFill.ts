import BN, { isBN } from 'bn.js';
export function zeroFill(str: string | BN) {
  return isBN(str) ? str.toString(16, 64) : str.padStart(64, '0');
}
