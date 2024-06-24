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
  console.log('LoginDemo init----------');

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

  return (
    <div>
      <Flex gap={'small'}>
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
          {JSON.stringify(walletInfo, undefined, 4)}
        </pre>
      </div>
      <div>walletType:{walletType}</div>
      <Divider />
    </div>
  );
};

export default LoginDemo;
