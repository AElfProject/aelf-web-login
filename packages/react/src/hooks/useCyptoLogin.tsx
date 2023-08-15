import { ILogin, WalletInfo } from '@aelf-web-login/core';

export type CryptoWalletType = 'discover' | 'nightElf';

export function useCryptoLogin<T extends WalletInfo>(login: ILogin<T>) {
  const handleLogin = () => login.login();
  return handleLogin;
}
