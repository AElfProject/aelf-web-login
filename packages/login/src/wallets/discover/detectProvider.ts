import detectProvider from '@portkey/detect-provider';
import { IPortkeyProvider } from '@portkey/provider-types';
import { WEB_LOGIN_VERSION } from '../../constants';

export default async function detectDiscoverProvider(): Promise<IPortkeyProvider | null> {
  const version = localStorage.getItem(WEB_LOGIN_VERSION);
  console.log(version, 'detectDiscoverProvider');
  let detectProviderFunc = detectProvider;
  if (typeof detectProvider !== 'function') {
    const detectProviderModule = detectProvider as any;
    detectProviderFunc = detectProviderModule.default;
  }
  return await detectProviderFunc({
    providerName: (version === '1' ? 'portkey' : 'Portkey') as keyof Window,
  });
}
