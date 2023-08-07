import { WalletType, useMultiWallets, SwitchWalletType } from 'aelf-web-login';

export default function MultiWallets() {
  const { wallets, switching, current, switchWallet } = useMultiWallets();

  console.log('current', current);
  console.log('wallets', wallets);

  return (
    <div>
      <div>switching: {switching ? 'switching wallet' : ''}</div>
      <div>
        <button disabled={current === WalletType.elf} onClick={() => switchWallet('elf')}>
          NightElf
        </button>
        <button disabled={current === WalletType.portkey} onClick={() => switchWallet('portkey')}>
          PortkeySDK
        </button>
        <button disabled={current === WalletType.discover} onClick={() => switchWallet('discover')}>
          Discover
        </button>
      </div>
    </div>
  );
}
