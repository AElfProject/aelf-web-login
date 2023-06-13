export type ExtraWalletNames = 'discover' | 'elf';

export type NightElfOptions = {
  connectEagerly: boolean;
};

export type PortkeyOptions = {
  autoShowUnlock: boolean;
  checkAccountInfoSync: boolean;
};

export type DiscoverOptions = {
  autoRequestAccount: boolean;
  autoLogoutOnDisconnected: boolean;
  autoLogoutOnNetworkMismatch: boolean;
  autoLogoutOnAccountMismatch: boolean;
  autoLogoutOnChainMismatch: boolean;
};

export type WebLoginProviderProps = {
  nightElf: NightElfOptions;
  portkey: PortkeyOptions;
  discover: DiscoverOptions;
  extraWallets: Array<ExtraWalletNames>;
  children: React.ReactNode;
};
