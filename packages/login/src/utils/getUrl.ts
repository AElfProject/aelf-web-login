import { LOGIN_VERSION } from '../constants';
import { getConfig } from '../config';

export function getUrl() {
  return new URL(location.href);
}
const getHost = (url: string) => new URL(url).host;
export function getFaviconUrl(url: string, size = 50): string {
  return `https://icon.horse/icon/${getHost(url)}/${size}`;
}

export const getStorageVersion = () => {
  const key = `${getConfig()?.appName}_${LOGIN_VERSION}`;
  // If there is an old version available, use the old one.
  if (!localStorage.getItem(key)) {
    const loginVersion = localStorage.getItem(LOGIN_VERSION);
    localStorage.setItem(key, loginVersion || 'v2');
  }
  return key;
};
