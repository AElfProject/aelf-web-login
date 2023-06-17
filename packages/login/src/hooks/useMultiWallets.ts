import { WalletInfo } from 'src/types';
import { useWebLoginContext } from '../context';
import { WalletType } from '../constants';
import { useCallback } from 'react';

export type SwitchWalletType = 'elf' | 'portkey' | 'discover';

export type SwitchWalletsHook = {
  current: WalletType;
  wallets: {
    nightElf: WalletInfo;
    portkey: WalletInfo;
    discover: WalletInfo;
  };
  switchWallet: (walletType: SwitchWalletType) => void;
};

export default function useMultiWallets(): SwitchWalletsHook {
  const webLoginContext = useWebLoginContext();
  const { nigthElf, portkey, discover } = webLoginContext._api;

  const switchWallet = useCallback(
    (walletType: SwitchWalletType) => {
      switch (walletType) {
        case 'elf':
          nigthElf.login();
          break;
        case 'portkey':
          portkey.login();
          break;
        case 'discover':
          discover.login();
          break;
      }
    },
    [discover, nigthElf, portkey],
  );

  return {
    current: webLoginContext.walletType,
    wallets: {
      nightElf: nigthElf.wallet,
      portkey: portkey.wallet,
      discover: discover.wallet,
    },
    switchWallet,
  };
}
