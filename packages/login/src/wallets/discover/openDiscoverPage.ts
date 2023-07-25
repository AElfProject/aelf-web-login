import { scheme } from '@portkey/utils';

export default function openPageInDiscover(url?: string) {
  window.location.href = scheme.formatScheme({
    action: 'linkDapp',
    domain: window.location.host,
    custom: {
      url: url || window.location.href,
    },
  });
}
