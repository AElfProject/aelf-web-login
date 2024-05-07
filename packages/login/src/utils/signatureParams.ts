import { SignatureParams } from '../types';

export default function (params: SignatureParams) {
  if (params.hexToBeSign) {
    console.error(
      'getSignature: hexToBeSign is deprecated, please use signInfo instead, signInfo is utf-8 string not hex',
    );
  }
}
