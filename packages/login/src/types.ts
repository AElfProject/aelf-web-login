export type ExtraWalletNames = 'portkey' | 'elf';

export type WebLoginProviderProps = {
  connectEagerly: boolean;
  autoShowUnlock: boolean;
  extraWallets: Array<ExtraWalletNames>;
  children: React.ReactNode;
};
