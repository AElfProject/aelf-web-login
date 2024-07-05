---
nav: Utils
group:
  order: 2
---

# Introduction

**@aelf-web-login/utils**: common utility library for aelf applications.

# Install

```sh
yarn add @aelf-web-login/utils
```

# Usage

## useCheckAllowanceAndApprove

```ts
const useCheckAllowanceAndApprove: ({
  tokenContractAddress,
  approveTargetAddress,
  account,
  amount,
  symbol,
  chainId,
}: {
  tokenContractAddress: string;
  approveTargetAddress: string;
  account: string;
  amount: string | number;
  symbol: string;
  chainId: TChainId;
}) => {
  start: () => Promise<unknown>;
  loading: boolean;
};
```

> compose getAllowance and approve code snippet

```ts
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useCheckAllowanceAndApprove } from '@aelf-web-login/utils';
import { Button } from 'aelf-design';

const Demo = () => {
  const { walletInfo, isConnected } = useConnectWallet();
  const { start, loading } = useCheckAllowanceAndApprove({
    tokenContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    approveTargetAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    account: walletInfo?.address as string,
    amount: '10',
    symbol: 'ELF',
    chainId: 'tDVW',
  });
  const checkAllowanceAndApproveHandler = async () => {
    const rs = await start();
    console.log(rs);
  };

  return (
    <Button
      type="primary"
      disabled={!isConnected}
      loading={loading}
      onClick={checkAllowanceAndApproveHandler}
    >
      AllowanceAndApprove
    </Button>
  );
};
```

## useGetBalance

```ts
const useGetBalance: ({
  tokenContractAddress,
  account,
  symbol,
  chainId,
}: {
  tokenContractAddress: string;
  account: string;
  symbol: string;
  chainId: TChainId;
}) => {
  getBalance: () => Promise<unknown>;
  loading: boolean;
};
```

> hook for get balance

```ts
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useGetBalance } from '@aelf-web-login/utils';
import { Button } from 'aelf-design';

const Demo = () => {
  const { walletInfo, isConnected } = useConnectWallet();
  const { getBalance, loading } = useGetBalance({
    tokenContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    account: walletInfo?.address as string,
    symbol: 'ELF',
    chainId: 'tDVW',
  });
  const getBalanceHandler = async () => {
    const rs = await getBalance();
    console.log(rs);
  };

  return (
    <Button type="primary" disabled={!isConnected} loading={loading} onClick={getBalanceHandler}>
      getBalance
    </Button>
  );
};
```

## getRawTransaction

```ts
interface IRawTransactionPrams {
  walletInfo: TWalletInfo;
  walletType: WalletTypeEnum;
  params: any;
  methodName: string;
  contractAddress: string;
  caContractAddress?: string;
  rpcUrl: string;
}
const getRawTransaction: (params: IRawTransactionPrams) => Promise<string | null>;
```

> compose getRawTransaction method of different wallet type

```ts
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { getRawTransaction } from '@aelf-web-login/utils';
import { Button } from 'aelf-design';

const Demo = () => {
  const { walletInfo, walletType, isConnected } = useConnectWallet();
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
    console.log(rs);
  };

  return (
    <Button type="primary" disabled={!isConnected} onClick={getRawTransactionHandler}>
      getRawTransaction
    </Button>
  );
};
```

## getTxResultRetry

```ts
function getTxResultRetry(TransactionId: string, rpcUrl: string, reGetCount?: number): Promise<any>;
```

> get transaction result use polling

```ts
import { getTxResultRetry } from '@aelf-web-login/utils';
import { Button } from 'aelf-design';
const Demo = () => {
  const getTxResultRetryHandler = async () => {
    const rs = await getTxResultRetry(
      '7511408b1ad12f6c14c8cc7cbca1a458b170bc3821812733768a2acb3cd433dc',
      'https://tdvw-test-node.aelf.io',
    );
    console.log(rs);
  };

  return (
    <Button type="primary" onClick={getTxResultRetryHandler}>
      getTxResultRetry
    </Button>
  );
};
```

## getOriginalAddress

```ts
function getOriginalAddress(address: string): string;
```

> get original address, remove the head and tail of the address

```ts
import { getOriginalAddress } from '@aelf-web-login/utils';
const Demo = () => {
  return (
    <div>{getOriginalAddress('ELF_rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk_tDVW')}</div>
  );
};
```

## addPrefixSuffix

```ts
function addPrefixSuffix(str: string, chainId?: string): string;
```

> add the head and tail of the address

```ts
import { addPrefixSuffix } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{addPrefixSuffix('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk')}</div>;
};
```

## decodeAddress

```ts
const decodeAddress: (address: string) => boolean;
```

> decode a wallet address

```ts
import { decodeAddress } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{decodeAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk') + ''}</div>;
};
```

## formatTime

```ts
function formatTime(date: string | number, formats?: string): string;
```

> format time, follow dayjs

```ts
import { formatTime } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{formatTime('2021/9/11')}</div>;
};
```

## createDuration

```ts
function createDuration(units: DurationUnitsObjectType): Duration;
function createDuration(time: number, unit?: DurationUnitType): Duration;
function createDuration(ISO_8601: string): Duration;
```

> Create a duration object.

```ts
import { createDuration } from '@aelf-web-login/utils';
const Demo = () => {
  return (
    <div>{createDuration({ days: 3, hours: 3, minutes: 45 }).format('DD[d] HH[h] mm[m]')}</div>
  );
};
```

## formatNumberWithDecimalPlaces

```ts
function formatNumberWithDecimalPlaces(val: BigNumber.Value, decimal?: number): string;
```

> format number with decimal places

```ts
import { formatNumberWithDecimalPlaces } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{formatNumberWithDecimalPlaces('12345.6789', 3)}</div>;
};
```

## formatPrice

```ts
function formatPrice(
  price: number | BigNumber | string,
  toFixedProps?: {
    decimalPlaces?: number;
    roundingMode?: BigNumber.RoundingMode;
    minValue?: number;
  },
): string;
```

> format price, when the price is less than minValue, will show '< minValue'

```ts
import { formatPrice } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{formatPrice(1111.1234, { minValue: 1200 })}</div>;
};
```

## isELFAddress

```ts
function isELFAddress(value: string): boolean;
```

> Determine whether the parameters are valid elf address

```ts
import { isELFAddress } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk') + ''}</div>;
};
```

## isPortkeyApp

```ts
function isPortkeyApp(): boolean;
```

> Determine whether the current environment is in Portkey APP

```ts
import { isPortkeyApp } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{isPortkeyApp() + ''}</div>;
};
```

## isPrivateKey

```ts
function isPrivateKey(privateKey?: string): boolean;
```

> Determine whether the parameters are valid private key

```ts
import { isPrivateKey } from '@aelf-web-login/utils';
const Demo = () => {
  return (
    <div>
      {isPrivateKey(
        '048001adae89cca64f63b8d014b16fd2519a61fa68bac9bc147684e589fbe8c4b976e7927fb3362d4ce14e8249d71390e16aeaf1eac3dc5e24a6c7ba3700d199b4',
      ) + ''}
    </div>
  );
};
```

## isMobileDevices

```ts
function isMobileDevices(): boolean;
```

> Determine whether the current environment is mobile

```ts
import { isMobileDevices } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{isMobileDevices() + ''}</div>;
};
```

## isAElfBridge

```ts
function isAElfBridge(aelfBridge: AElfDappBridge): boolean;
```

> Receive a parameter of any, return whether it is AElfDappBridge's instance.

```ts
import { isAElfBridge } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{isAElfBridge({ x: 1 } as any) + ''}</div>;
};
```

## divDecimals

```
function divDecimals(a: BigNumber.Value, decimals?: string | number): BigNumber
```

```ts
import { divDecimals } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{divDecimals(100000000, 8).toString()}</div>;
};
```

## timesDecimals

```
function timesDecimals(a: BigNumber.Value, decimals?: string | number): BigNumber
```

```ts
import { timesDecimals } from '@aelf-web-login/utils';
const Demo = () => {
  return <div>{timesDecimals(1, 8).toString()}</div>;
};
```

## Loading

> Receive a parameter of React.ReactNode type, return a instance including a 'show' and 'hide' method.

```ts
import { Loading } from '@aelf-web-login/utils';
import { Button, Loading as AelfdLoading } from 'aelf-design';
const Demo = () => {
  const loadingInstance = new Loading(
    (
      <AelfdLoading open={true} />
    ),
  );
  const onLoadingHandler = () => {
    loadingInstance.show();
    setTimeout(() => {
      loadingInstance.hide();
    }, 3000);
  };
  return (
     <Button type="primary" onClick={onLoadingHandler}>
        show loading
     </Button>
  )
}
```

## sleep

```
sleep: (milliseconds: number) => Promise<void>
```

> Set a waiting time

```ts
import { sleep } from '@aelf-web-login/utils';
import { Button } from 'aelf-design';
const Demo = () => {
  const [sleepMsg, setSleep] = useState('');
  return (
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
  );
};
```
