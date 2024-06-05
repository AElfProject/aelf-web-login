import { useState } from 'react';
import { Button, Input } from 'antd';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

const SignatureDemo: React.FC = () => {
  const { walletInfo, getSignature } = useConnectWallet();
  const [signInfo, setSignInfo] = useState('');
  const [signed, setSigned] = useState('');

  const sign = async () => {
    const signature = await getSignature({
      signInfo,
      appName: '',
      address: '',
    });
    console.log('signature', signature);
    setSigned(signature!.signature);
  };

  return (
    <div>
      <div>
        <Button disabled={!walletInfo} onClick={sign}>
          Sign
        </Button>
        <Input value={signInfo} onChange={(e: any) => setSignInfo(e.target.value)} />
        <div>{signed}</div>
      </div>
    </div>
  );
};

export default SignatureDemo;
