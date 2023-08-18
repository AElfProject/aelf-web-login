import isAElfWallet from './isAElfWallet';
import isPortkeyApp from './isPortkeyApp';

export type WebEnv = 'NightElf' | 'AElfWallet' | 'Discover';

export function detectWebEnv(): WebEnv[] {
  const win = window as any;
  const envList: WebEnv[] = [];

  if (isPortkeyApp()) {
    envList.push('Discover');
    return envList;
  }

  if (isAElfWallet()) {
    envList.push('AElfWallet');
    return envList;
  }

  if (win.NightElf) {
    envList.push('NightElf');
  }
  if (win.portkey) {
    envList.push('Discover');
  }

  return envList;
}
