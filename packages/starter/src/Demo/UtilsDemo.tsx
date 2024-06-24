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
  isMobileDevices,
  isAElfBridge,
  getRawTransaction,
  getTxResultRetry,
  divDecimals,
  timesDecimals,
  sleep,
} from '@aelf-web-login/utils';
import { Button, Divider, Flex, Modal } from 'antd';
import { useState } from 'react';

const UtilsDemo: React.FC = () => {
  const { walletInfo, isConnected, walletType } = useConnectWallet();
  const [sleepMsg, setSleep] = useState('');
  const [balanceData, setBalanceData] = useState({});
  const [txResultRetry, setTxResultRetry] = useState();
  const [rawTransaction, setRawTransaction] = useState<string | null>();
  const [checkAllowanceAndApprove, setCheckAllowanceAndApprove] = useState<any>(false);
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

  const loadingInstance = new Loading(
    (
      <Modal title={null} footer={null} open={true} closable={false}>
        <p>loading...</p>
      </Modal>
    ),
  );

  const checkAllowanceAndApproveHandler = async () => {
    const rs = await start();
    setCheckAllowanceAndApprove(rs);
  };

  const getBalanceHandler = async () => {
    const rs = await getBalance();
    setBalanceData(rs as any);
  };

  const getTxResultRetryHandler = async () => {
    const rs = await getTxResultRetry(
      '7511408b1ad12f6c14c8cc7cbca1a458b170bc3821812733768a2acb3cd433dc',
      'https://tdvw-test-node.aelf.io',
    );
    setTxResultRetry(rs as any);
  };

  const getRawTransactionHandler = async () => {
    const rs = await getRawTransaction({
      walletInfo: walletInfo,
      walletType: walletType,
      params: { symbol: 'ELF', owner: walletInfo?.address },
      methodName: 'GetBalance',
      contractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
      caContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
      rpcUrl: 'https://tdvw-test-node.aelf.io',
    });
    setRawTransaction(rs);
  };

  const onLoadingHandler = () => {
    loadingInstance.show();
    setTimeout(() => {
      loadingInstance.hide();
    }, 3000);
  };
  return (
    <div>
      <Flex vertical={true} gap={16}>
        <h1>Contract</h1>
        <div>
          <Button
            type="primary"
            disabled={!isConnected}
            loading={allowanceAndApproveLoading}
            onClick={checkAllowanceAndApproveHandler}
          >
            AllowanceAndApprove
          </Button>
          <div>
            <h4>Result</h4>
            <pre className="result">{JSON.stringify(checkAllowanceAndApprove, null, '  ')}</pre>
          </div>
        </div>
        <div>
          <Button
            type="primary"
            disabled={!isConnected}
            loading={getBalanceLoading}
            onClick={getBalanceHandler}
          >
            getBalance
          </Button>
          <div>
            <h4>Result</h4>
            <pre className="result">{JSON.stringify(balanceData, null, '  ')}</pre>
          </div>
        </div>
        <div>
          <Button type="primary" disabled={!isConnected} onClick={getRawTransactionHandler}>
            getRawTransaction
          </Button>

          <div>
            <h4>Result</h4>
            <pre className="result">{rawTransaction}</pre>
          </div>
        </div>

        <div>
          <Button type="primary" onClick={getTxResultRetryHandler}>
            getTxResultRetry
          </Button>

          <div>
            <h4>Result</h4>
            <pre className="result">{JSON.stringify(txResultRetry, null, '  ')}</pre>
          </div>
        </div>
      </Flex>
      <Divider />
      <Flex vertical={true} gap={16}>
        <h1>Address</h1>
        <div>
          <div>{`getOriginalAddress('ELF_rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk_tDVW')`}</div>
          <div>
            {getOriginalAddress('ELF_rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk_tDVW')}
          </div>
        </div>
        <div>
          <div>{`addPrefixSuffix('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk')`}</div>
          <div>{addPrefixSuffix('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk')}</div>
        </div>
        <div>
          <div>{`decodeAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk')`}</div>
          <div>{decodeAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk') + ''}</div>
        </div>
      </Flex>
      <Divider />
      <Flex vertical={true} gap={16}>
        <h1>Format</h1>

        <div>
          <div>{`formatTime('2021/9/11'):`}</div>
          <div>{formatTime('2021/9/11')}</div>
        </div>
        <div>
          <div>{`createDuration({ days: 3, hours: 3, minutes: 45 }).format('DD[d] HH[h] mm[m]')`}</div>
          <div>
            {createDuration({ days: 3, hours: 3, minutes: 45 }).format('DD[d] HH[h] mm[m]')}
          </div>
        </div>
        <div>
          <div>{`formatNumberWithDecimalPlaces('12345.6789', 3)`}</div>
          <div>{formatNumberWithDecimalPlaces('12345.6789', 3)}</div>
        </div>
        <div>
          <div>{`formatPrice(1111.1234, { minValue: 1100 })`}</div>
          <div>{formatPrice(1111.1234, { minValue: 1100 })}</div>
          <div>{`formatPrice(1111.1234, { minValue: 1200 })`}</div>
          <div>{formatPrice(1111.1234, { minValue: 1200 })}</div>
        </div>
      </Flex>
      <Divider />
      <Flex vertical={true} gap={16}>
        <h1>Is</h1>
        <div>
          <div>{`isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBh86rUtoQNyk')`}</div>
          <div>{isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk') + ''}</div>
        </div>
        <div>
          <div>{`isPortkeyApp()`}</div>
          <div>{isPortkeyApp() + ''}</div>
        </div>
        <div>
          <div style={{ wordWrap: 'break-word' }}>{`isPrivateKey(
          '048001adae89cca64f63b8d014b16fd2519a61fa68bac9bc147684e589fbe8c4b976e7927fb3362d4ce14e8249d71390e16aeaf1eac3dc5e24a6c7ba3700d199b4'
        ) `}</div>
          <div>
            {isPrivateKey(
              '048001adae89cca64f63b8d014b16fd2519a61fa68bac9bc147684e589fbe8c4b976e7927fb3362d4ce14e8249d71390e16aeaf1eac3dc5e24a6c7ba3700d199b4',
            ) + ''}
          </div>
        </div>
        <div>
          <div>{`isMobileDevices()`}</div>
          <div>{isMobileDevices() + ''}</div>
        </div>
        <div>
          <div>{`isAElfBridge({x:1})`}</div>
          <div>{isAElfBridge({ x: 1 } as any) + ''}</div>
        </div>
      </Flex>
      <Divider />
      <Flex vertical={true} gap={16}>
        <h1>Calculate</h1>
        <div>
          <div>{`divDecimals(100000000,8)`}</div>
          <div>{divDecimals(100000000, 8).toString()}</div>
        </div>
        <div>
          <div>{`timesDecimals(1,8)`}</div>
          <div>{timesDecimals(1, 8).toString()}</div>
        </div>
      </Flex>
      <Divider />
      <Flex vertical={true} gap={16}>
        <h1>Utility</h1>
        <div>
          <Button type="primary" onClick={onLoadingHandler}>
            show loading
          </Button>
        </div>
        <div>
          <Button
            type="primary"
            onClick={async () => {
              await sleep(1000);
              setSleep('I am show after 1s');
            }}
          >
            sleep(1000)
          </Button>
          {sleepMsg}
        </div>
      </Flex>
    </div>
  );
};

export default UtilsDemo;
