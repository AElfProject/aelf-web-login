import detectProvider from '@portkey/detect-provider';

export default async function detectDiscoverProvider() {
  let detectProviderFunc = detectProvider;
  if (typeof detectProvider !== 'function') {
    const detectProviderModule = detectProvider as any;
    detectProviderFunc = detectProviderModule.default;
  }
  return await detectProviderFunc();
}
