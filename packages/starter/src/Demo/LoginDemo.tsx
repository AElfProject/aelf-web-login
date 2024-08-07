import { useEffect } from 'react';
import { Button, message, Divider, Flex } from 'antd';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

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
  } = useConnectWallet();
  console.log('LoginDemo init----------', isConnected);

  useEffect(() => {
    console.log('isConnected-------', isConnected);
  }, [isConnected]);

  const onConnectBtnClickHandler = async () => {
    try {
      const rs = await connectWallet();
      console.log('onConnectBtnClickHandler', rs);
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

  const onDisConnectBtnClickHandler = async () => {
    const rs = await disConnectWallet();
    console.log('log after execute disConnectWallet', rs);
  };

  return (
    <div>
      <Flex gap={'small'}>
        <Button type="primary" onClick={onConnectBtnClickHandler} disabled={isConnected}>
          {isLocking ? 'unlock' : 'connect'}
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
          {JSON.stringify(walletInfo, undefined, 4)}
        </pre>
      </div>
      <div>walletType:{walletType}</div>
      <Divider />
    </div>
  );
};

export default LoginDemo;
