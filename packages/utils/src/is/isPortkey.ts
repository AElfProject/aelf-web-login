export function isPortkey() {
  if (typeof window !== 'object') {
    return;
  }
  return window.navigator.userAgent.includes('Portkey');
}
