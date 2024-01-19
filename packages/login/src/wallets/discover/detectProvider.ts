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
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
  // console.log(resV1, 'resV1');
  const res = await detectProviderFunc({
    // timeout: 6000,
    providerName: (version === '1' ? 'portkey' : 'Portkey') as keyof Window,
  });
  // console.log(res, 'res');
  return res;
}
