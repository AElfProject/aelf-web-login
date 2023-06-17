import { WalletInfo } from 'src/types';
import { useWebLoginContext } from '../context';
import { WalletType, WebLoginEvents } from '../constants';
import { useCallback, useState } from 'react';
import useWebLoginEvent from './useWebLoginEvent';

export type SwitchWalletType = 'elf' | 'portkey' | 'discover';

export type SwitchWalletsHook = {
  current: WalletType;
  switching: boolean;
  wallets: {
    nightElf: WalletInfo;
    portkey: WalletInfo;
    discover: WalletInfo;
  };
  switchWallet: (walletType: SwitchWalletType) => void;
};

export default function useMultiWallets(): SwitchWalletsHook {
  const webLoginContext = useWebLoginContext();
  const [switchingWalletType, setSwitchingWalletType] = useState<WalletType>(WalletType.unknown);
  const { nigthElf, portkey, discover } = webLoginContext._api;

  const switchWallet = useCallback(
    (walletType: SwitchWalletType) => {
      setSwitchingWalletType(walletType as WalletType);
      // TODO logout previous wallet
      switch (walletType) {
        case 'elf':
          nigthElf.loginBySwitch();
          break;
        case 'portkey':
          portkey.loginBySwitch();
          break;
        case 'discover':
          discover.loginBySwitch();
          break;
      }
    },
    [discover, nigthElf, portkey],
  );

  return {
    current: webLoginContext.walletType,
    switching: switchingWalletType !== WalletType.unknown,
    wallets: {
      nightElf: nigthElf.wallet,
      portkey: portkey.wallet,
      discover: discover.wallet,
    },
    switchWallet,
  };
}
