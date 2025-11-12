import detectProvider from '@portkey/detect-provider';
import { IPortkeyProvider } from '@portkey/provider-types';

export default async function detectWebProvider(count = 0): Promise<IPortkeyProvider | null> {
  let detectProviderFunc = detectProvider;
  if (typeof detectProvider !== 'function') {
    const detectProviderModule = detectProvider as any;
    detectProviderFunc = detectProviderModule.default;
  }
  try {
    const res = await detectProviderFunc({
      timeout: 9000,
      providerName: 'PortkeyWebWallet',
    });
    return res;
  } catch (e) {
    count++;
    console.log('detectDiscoverProvider error portkey web', e);
    if (count > 5) return null;
    return detectWebProvider(count);
  }
}
