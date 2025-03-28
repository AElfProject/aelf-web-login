export function isFairyVaultApp() {
  if (typeof window !== 'object') {
    return false;
  } else {
    return window.navigator.userAgent.includes('FairyVault');
  }
}
