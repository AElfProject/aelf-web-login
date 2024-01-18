import { event$ } from '../config';

export default function isPortkeyApp() {
  const ua = navigator.userAgent;
  return ua.indexOf('Portkey did Mobile') !== -1;
}

export const changePortkeyVersion = (version: string) => {
  const changedVer = '' + (2 - ((+version + 1) % 2));
  event$.emit({
    version: changedVer,
  });
};
