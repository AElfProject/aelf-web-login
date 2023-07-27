import { scheme } from '@portkey/utils';

export default function openPageInDiscover(url?: string) {
  try {
    window.location.href = scheme.formatScheme({
      action: 'linkDapp',
      domain: window.location.host,
      custom: {
        url: url || window.location.href,
      },
    });
  } catch (error) {
    console.warn(error);
    window.open('https://portkey.finance', '_blank');
  }
}
