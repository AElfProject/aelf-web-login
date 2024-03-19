import detectProvider from '@portkey/detect-provider';
import { IPortkeyProvider } from '@portkey/provider-types';
import { getStorageVersion } from '../../utils/getUrl';

export default async function detectDiscoverProvider(version?: string | null): Promise<IPortkeyProvider | null> {
  const WEB_LOGIN_VERSION = getStorageVersion();
  version = version || localStorage.getItem(WEB_LOGIN_VERSION);
  let detectProviderFunc = detectProvider;
  if (typeof detectProvider !== 'function') {
    const detectProviderModule = detectProvider as any;
    detectProviderFunc = detectProviderModule.default;
  }
  const res = await detectProviderFunc({
    timeout: 6000,
    providerName: version === 'v1' ? 'portkey' : 'Portkey',
  });
  return res;
}
