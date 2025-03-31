import { TSignatureParams } from '@aelf-web-login/wallet-adapter-base';

export default function (params: TSignatureParams) {
  if (params.hexToBeSign) {
    console.error(
      'getSignature: hexToBeSign is deprecated, please use signInfo instead, signInfo is utf-8 string not hex',
    );
  }
}
