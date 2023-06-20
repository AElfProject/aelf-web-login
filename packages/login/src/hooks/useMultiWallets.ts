import { WalletInfo } from 'src/types';
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

function useLogoutBySwitch() {
  const webLoginContext = useWebLoginContext();
  const { nigthElf, portkey, discover } = webLoginContext._api;
  const [promise, setPromise] = useState<PromiseCallbacks>();

  useWebLoginEvent(WebLoginEvents.LOGOUT, () => {
    promise?.resolve();
  });

  return useCallback(() => {
    const current = webLoginContext.walletType;
    if (current === WalletType.unknown) {
      return Promise.resolve();
    }
    const promise = new Promise<void>((resolve, reject) => {
      setPromise({ resolve, reject });
    });
    switch (current) {
      case 'elf':
        nigthElf.logoutBySwitch();
        break;
      case 'portkey':
        portkey.logoutBySwitch();
        break;
      case 'discover':
        discover.logoutBySwitch();
        break;
    }
    return promise;
  }, [discover, nigthElf, portkey, webLoginContext.walletType]);
}

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
  const [switchingWalletType, setSwitchingWalletType] = useState<WalletType>(WalletType.unknown);
  const { nigthElf, portkey, discover } = webLoginContext._api;

  const logoutBySwitch = useLogoutBySwitch();
  const loginBySwitch = useLoginBySwitch();

  const switchWallet = useCallback(
    async (walletType: SwitchWalletType) => {
      setSwitchingWalletType(walletType as WalletType);
      await logoutBySwitch();
      await loginBySwitch(walletType);
      setSwitchingWalletType(WalletType.unknown);
    },
    [loginBySwitch, logoutBySwitch],
  );

  return {
    current: webLoginContext.walletType,
    switchingWallet: switchingWalletType,
    switching: switchingWalletType !== WalletType.unknown,
    wallets: {
      nightElf: nigthElf.wallet,
      portkey: portkey.wallet,
      discover: discover.wallet,
    },
    switchWallet,
  };
}
