import { SwitchWalletFunc, WalletInfo } from 'src/types';
import { useWebLoginContext } from '../context';
import { WalletType, WebLoginEvents } from '../constants';
import { useCallback, useState } from 'react';
import useWebLoginEvent from './useWebLoginEvent';
import { ERR_CODE, makeError } from '../errors';

export type SwitchWalletType = 'elf' | 'portkey' | 'discover';

export type SwitchWalletsHook = {
  current: WalletType;
  switching: boolean;
  switchingWallet: WalletType;
  wallets: {
    nightElf: WalletInfo;
    portkey: WalletInfo;
    discover: WalletInfo;
  };
  switchWallet: (walletType: SwitchWalletType) => Promise<void>;
};

type PromiseCallbacks = {
  resolve: () => void;
  reject: (reason?: any) => void;
};

function useLoginBySwitch() {
  const webLoginContext = useWebLoginContext();
  const { nigthElf, portkey, discover } = webLoginContext._api;
  const [promise, setPromise] = useState<PromiseCallbacks>();

  useWebLoginEvent(WebLoginEvents.LOGINED, () => {
    promise?.resolve();
  });
  useWebLoginEvent(WebLoginEvents.LOGIN_ERROR, (error: any) => {
    promise?.reject(error);
  });
  useWebLoginEvent(WebLoginEvents.USER_CANCEL, () => {
    promise?.reject(makeError(ERR_CODE.USER_CANCEL));
  });

  return useCallback(
    async (walletType: SwitchWalletType) => {
      const promise = new Promise<void>((resolve, reject) => {
        setPromise({ resolve, reject });
      });
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
        default:
          throw new Error(`Invalid wallet type: ${walletType}`);
      }
      return promise;
    },
    [discover, nigthElf, portkey],
  );
}

export default function useMultiWallets(): SwitchWalletsHook {
  const webLoginContext = useWebLoginContext();
  const { switching, switchingWallet, setSwitingWallet } = webLoginContext._multiWallets;
  const { nigthElf, portkey, discover } = webLoginContext._api;
  const currentWalletType = webLoginContext.walletType;

  const loginBySwitch = useLoginBySwitch();

  const switchWallet = useCallback(
    async (walletType: SwitchWalletType) => {
      if (currentWalletType === WalletType.unknown) {
        throw new Error('Please login first');
      }
      setSwitingWallet(walletType as WalletType);
      let switchWalletFunc: SwitchWalletFunc;
      switch (currentWalletType) {
        case 'elf':
          switchWalletFunc = nigthElf.switchWallet;
          break;
        case 'portkey':
          switchWalletFunc = portkey.switchWallet;
          break;
        case 'discover':
          switchWalletFunc = discover.switchWallet;
          break;
        default:
          throw new Error('Please login first');
      }

      await switchWalletFunc(async (commit, rollback) => {
        try {
          await loginBySwitch(walletType);
          await commit();
        } catch (e: any) {
          await rollback();
          throw e;
        }
      });

      setSwitingWallet(WalletType.unknown);
    },
    [
      currentWalletType,
      discover.switchWallet,
      loginBySwitch,
      nigthElf.switchWallet,
      portkey.switchWallet,
      setSwitingWallet,
    ],
  );

  return {
    current: webLoginContext.walletType,
    switchingWallet,
    switching,
    wallets: {
      nightElf: nigthElf.wallet,
      portkey: portkey.wallet,
      discover: discover.wallet,
    },
    switchWallet,
  };
}
