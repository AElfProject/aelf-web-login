import detectProvider from '@portkey/detect-provider';
import { IPortkeyProvider } from '@portkey/provider-types';

export default async function detectDiscoverProvider(): Promise<IPortkeyProvider | null> {
  let detectProviderFunc = detectProvider;
  if (typeof detectProvider !== 'function') {
    const detectProviderModule = detectProvider as any;
    detectProviderFunc = detectProviderModule.default;
  }
  try {
    const res = await detectProviderFunc({
      timeout: 6000,
      // providerName: 'Portkey',
      providerName: 'FairyVault',
    });
    console.log(res, 'detectDiscoverProvider res===');
    return res;
  } catch (e) {
    console.log('detectDiscoverProvider error fairy vault', e);
    return null;
  }
}
