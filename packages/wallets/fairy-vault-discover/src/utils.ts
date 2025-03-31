import BN, { isBN } from 'bn.js';
import { scheme } from '@portkey/utils';

export function zeroFill(str: string | BN) {
  return isBN(str) ? str.toString(16, 64) : str.padStart(64, '0');
}

export function openPageInDiscover(url?: string, version?: 'v1') {
  console.info('TODO List', url, version);
  // TODO: change link to fairy vault
  // try {
  //   window.location.href = scheme.formatScheme({
  //     action: 'linkDapp',
  //     version,
  //     domain: window.location.host,
  //     custom: {
  //       url: url || window.location.href,
  //     },
  //   });
  //   const downloadUrl = 'https://portkey.finance/';
  //   setTimeout(() => {
  //     const hidden =
  //       window.document.hidden ||
  //       (window.document as any).mozHidden ||
  //       (window.document as any).msHidden ||
  //       (window.document as any).webkitHidden;
  //     if (typeof hidden !== 'undefined' && hidden === true) {
  //       return;
  //     }
  //     window.location.href = downloadUrl;
  //   }, 2000);
  // } catch (error) {
  //   // can‘t open app cannot go into this logic
  //   console.error(error);
  //   window.open('https://portkey.finance', '_blank');
  // }
}
