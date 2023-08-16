import { ILogin, WalletInfo } from '@aelf-web-login/core';

export type CryptoWalletType = 'discover' | 'nightElf';

export function useExtraWalletLogin<T extends WalletInfo>(login: ILogin<T>) {
  const handleLogin = () => login.login();
  // TODO: debounce
  // TODO: click logic
  return handleLogin;
}
