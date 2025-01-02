import { useEffect } from 'react';
import useConnectWallet from '../useConnectWallet';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
export default function Updater() {
  const { checkLoginStatus, disConnectWallet, walletType } = useConnectWallet();

  useEffect(() => {
    if (walletType !== WalletTypeEnum.aa) return;
    const check = async () => {
      const status = await checkLoginStatus();
      if (status === 'FAIL') {
        await disConnectWallet();
      }
    };
    check();
  }, [checkLoginStatus, disConnectWallet, walletType]);
  return null;
}
