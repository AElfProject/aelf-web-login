export function isPortkeyApp() {
  if (typeof window !== 'object') {
    return false;
  } else {
    return window.navigator.userAgent.includes('Portkey');
  }
}
