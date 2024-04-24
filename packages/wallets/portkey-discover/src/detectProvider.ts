import detectProvider from '@portkey/detect-provider';
import { IPortkeyProvider } from '@portkey/provider-types';

export default async function detectDiscoverProvider(
  version?: string | null,
): Promise<IPortkeyProvider | null> {
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
