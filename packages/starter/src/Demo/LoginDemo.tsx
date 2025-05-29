import { useEffect, useMemo } from 'react';
import { Button, message, Divider, Flex } from 'antd';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
// import { demoFn } from '@aelf-web-login/wallet-adapter-bridge';

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
    goAssets,
  } = useConnectWallet();
  console.log('LoginDemo init----------', isConnected);

  useEffect(() => {
    console.log('isConnected-------', isConnected);
  }, [isConnected]);

  const onConnectBtnClickHandler = async () => {
    try {
      console.log('onConnectBtnClickHandler start');
      const rs = await connectWallet();
      console.log('onConnectBtnClickHandler', rs);
    } catch (e: any) {
      console.log(e, 'onConnectBtnClickHandler error===');
      message.error(e.nativeError ? e.nativeError.message : e.message, 6);
    }
  };

  useEffect(() => {
    console.log('walletInfo', walletInfo);
  }, [walletInfo]);

  useEffect(() => {
    if (!loginError) {
      return;
    }
    message.error(loginError.message);
  }, [loginError]);

  const onDisConnectBtnClickHandler = async () => {
    const rs = await disConnectWallet();
    console.log('log after execute disConnectWallet', rs);
  };

  const _walletInfo = useMemo(() => {
    if (!walletInfo) return walletInfo;
    return {
      address: walletInfo?.address,
      name: walletInfo?.name,
      extraInfo: {
        accounts: walletInfo?.extraInfo?.accounts,
        nickName: walletInfo?.extraInfo?.nickName,
      },
    };
  }, [walletInfo]);

  console.log(isLocking, 'isLocking===');

  return (
    <div>
      <h3>Login Demo</h3>
      <Flex gap={'small'}>
        {/* <Button
          onClick={() => {
            demoFn(true);
          }}
        >
          open
        </Button>
        <Button
          onClick={() => {
            demoFn(false);
          }}
        >
          close
        </Button> */}
        <Button type="primary" onClick={onConnectBtnClickHandler} disabled={isConnected}>
          {isLocking ? 'unlock' : 'connect'}
        </Button>
        <Button type="default" onClick={onConnectBtnClickHandler}>
          {isLocking ? 'unlock' : 'connect'}, if auto connect failed.
        </Button>
        <Button type="primary" onClick={lock} disabled={!isConnected}>
          lock
        </Button>
        <Button type="primary" onClick={onDisConnectBtnClickHandler} disabled={!isConnected}>
          disconnect
        </Button>
      </Flex>
      <div>isConnected: {isConnected + ''}</div>
      <div>
        walletInfo:
        <pre style={{ overflow: 'auto', height: '300px' }}>
          {JSON.stringify(_walletInfo, undefined, 4)}
        </pre>
      </div>
      <div>walletType:{walletType}</div>
      <Divider />
      <Button onClick={() => goAssets()}>show Assets</Button>
    </div>
  );
};

export default LoginDemo;
