import detectProvider from '@portkey/detect-provider';
import { IPortkeyProvider } from '@portkey/provider-types';
import { getConfig } from '../../config';

export default async function detectDiscoverProvider(): Promise<IPortkeyProvider | null> {
  const { version } = getConfig();
  let detectProviderFunc = detectProvider;
  if (typeof detectProvider !== 'function') {
    const detectProviderModule = detectProvider as any;
    detectProviderFunc = detectProviderModule.default;
  }
  // console.log(version?.discover, 'version?.discover');
  return await detectProviderFunc({
    providerName: (version?.discover === 1 ? 'portkey' : 'Portkey') as keyof Window,
  });
}
