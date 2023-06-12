export type ExtraWalletNames = 'discover' | 'elf';

export type WebLoginProviderProps = {
  connectEagerly: boolean;
  autoShowUnlock: boolean;
  checkAccountInfoSync: boolean | undefined;
  extraWallets: Array<ExtraWalletNames>;
  children: React.ReactNode;
};
