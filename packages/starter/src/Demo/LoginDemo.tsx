import { useEffect, useState } from 'react';
import { Button, message, Divider, Flex } from 'antd';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import {
  useCheckAllowanceAndApprove,
  useGetBalance,
  formatTime,
  createDuration,
  formatNumberWithDecimalPlaces,
  formatPrice,
  getOriginalAddress,
  addPrefixSuffix,
  decodeAddress,
  isELFAddress,
  isPortkeyApp,
  isPrivateKey,
  Loading,
} from '@aelf-web-login/utils';

const LoginDemo: React.FC = () => {
  const {
    connectWallet,
    disConnectWallet,
    walletInfo,
    lock,
    isLocking,
    walletType,
    isConnected,
    loginError,
    getAccountByChainId,
    getWalletSyncIsCompleted,
  } = useConnectWallet();
  console.log('LoginDemo init----------');
  const [aelfAccount, setAelfAccount] = useState<string>('');
  const [tdvwAccount, setTdvwAccount] = useState<string>('');
  const [syncIsCompleted, setSyncIsCompleted] = useState<string | boolean>(false);
  const [syncIsCompletedTDVW, setSyncIsCompletedTDVW] = useState<string | boolean>(false);

  const { start, loading: allowanceAndApproveLoading } = useCheckAllowanceAndApprove({
    tokenContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    approveTargetAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    account: walletInfo?.address as string,
    amount: '65',
    symbol: 'ELF',
    chainId: 'tDVW',
  });

  const { getBalance, loading: getBalanceLoading } = useGetBalance({
    tokenContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    account: walletInfo?.address as string,
    symbol: 'ELF',
    chainId: 'tDVW',
  });

  const loadingInstance = new Loading(<div style={{ color: 'red' }}>xxxx</div>);

  const onConnectBtnClickHandler = async () => {
    try {
      const rs = await connectWallet();
      console.log('rs', rs);
    } catch (e: any) {
      // message.error(e.message);
    }
  };

  useEffect(() => {
    if (!loginError) {
      return;
    }
    message.error(loginError.message);
  }, [loginError]);

  const onDisConnectBtnClickHandler = () => {
    disConnectWallet();
  };

  const onGetAccountByAELFHandler = async () => {
    const account = await getAccountByChainId('AELF');
    setAelfAccount(account);
  };

  const onGetAccountBytDVWHandler = async () => {
    const account = await getAccountByChainId('tDVW');
    setTdvwAccount(account);
  };

  const onGetWalletSyncIsCompletedHandler = async () => {
    const account = await getWalletSyncIsCompleted('AELF');
    setSyncIsCompleted(account);
  };

  const onGetWalletSyncIsCompletetDVWdHandler = async () => {
    const account = await getWalletSyncIsCompleted('tDVW');
    setSyncIsCompletedTDVW(account);
  };

  const checkAllowanceAndApproveHandler = async () => {
    const rs = await start();
    console.log('--------', rs);
  };

  const getBalanceHandler = async () => {
    const rs = await getBalance();
    console.log('--------', rs);
  };

  const onLoadingHandler = () => {
    loadingInstance.show();
    setTimeout(() => {
      loadingInstance.hide();
    }, 3000);
  };

  return (
    <div>
      <div>{formatTime('2021/9/11')}</div>
      <div>{createDuration({ days: 3, hours: 3, minutes: 45 }).format('DD[d] HH[h] mm[m]')}</div>
      <div>{formatNumberWithDecimalPlaces('12113.11', 3)}</div>
      <div>{formatPrice(1111.1234, { minValue: 1100 })}</div>
      <div>{getOriginalAddress('ELF_xxxx_dd')}</div>
      <div>{addPrefixSuffix('FASFSAFSADFSADFS ')}</div>
      <div>{decodeAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk') + ''}</div>
      <div>{isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBh86rUtoQNyk') + ''}</div>
      <div>{isPortkeyApp() + ''}</div>
      <div>
        {isPrivateKey(
          '048001adae89cca64f63b8d014b16fd2519a61fa68bac9bc147684e589fbe8c4b976e7927fb3362d4ce14e8249d71390e16aeaf1eac3dc5e24a6c7ba3700d199b4',
        ) + ''}
      </div>
      <Button onClick={onLoadingHandler}>loading</Button>
      <Flex gap={'small'}>
        <Button loading={allowanceAndApproveLoading} onClick={checkAllowanceAndApproveHandler}>
          AllowanceAndApprove
        </Button>
        <Button loading={getBalanceLoading} onClick={getBalanceHandler}>
          getBalance
        </Button>
        <Button type="primary" onClick={onConnectBtnClickHandler} disabled={isConnected}>
          {isLocking ? 'unlock' : 'connect'}
        </Button>
        <Button type="primary" onClick={lock} disabled={!walletInfo}>
          lock
        </Button>
        <Button type="primary" onClick={onDisConnectBtnClickHandler} disabled={!isConnected}>
          disconnect
        </Button>
      </Flex>
      <div>
        walletInfo:
        <pre style={{ overflow: 'auto', height: '300px' }}>
          {JSON.stringify(walletInfo, null, 4)}
        </pre>
      </div>
      <div>walletType:{walletType}</div>
      <Divider />
      <Button type="primary" onClick={onGetAccountByAELFHandler}>
        getAccountByChainId-AELF
      </Button>
      <div>getAccountByChainId-AELF:{aelfAccount}</div>

      <Button type="primary" onClick={onGetAccountBytDVWHandler}>
        getAccountByChainId-tDVW
      </Button>
      <div>getAccountByChainId-tDVW:{tdvwAccount}</div>
      <Divider />
      <Button type="primary" onClick={onGetWalletSyncIsCompletedHandler}>
        getWalletSyncIsCompleted-AELF
      </Button>
      <div>getWalletSyncIsCompleted-AELF:{syncIsCompleted}</div>

      <Button type="primary" onClick={onGetWalletSyncIsCompletetDVWdHandler}>
        getWalletSyncIsCompleted-tDVW
      </Button>
      <div>getWalletSyncIsCompleted-tDVW:{syncIsCompletedTDVW}</div>
      <Divider />
    </div>
  );
};

export default LoginDemo;
