import { scheme } from '@portkey/utils';

export default function openPageInDiscover(url?: string, version?: 'v1') {
  try {
    window.location.href = scheme.formatScheme({
      action: 'linkDapp',
      version,
      domain: window.location.host,
      custom: {
        url: url || window.location.href,
      },
    });
  } catch (error) {
    console.error(error);
    window.open('https://portkey.finance', '_blank');
  }
}
