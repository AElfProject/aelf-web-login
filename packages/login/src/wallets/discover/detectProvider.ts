import detectProvider from '@portkey/detect-provider';
import { IPortkeyProvider } from '@portkey/provider-types';
import { WEB_LOGIN_VERSION } from '../../constants';

export default async function detectDiscoverProvider(): Promise<IPortkeyProvider | null> {
  const version = localStorage.getItem(WEB_LOGIN_VERSION);
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
