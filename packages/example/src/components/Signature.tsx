import { WalletType, useMultiWallets, SwitchWalletType, useWebLogin } from 'aelf-web-login';
import { useState } from 'react';

export default function Signature() {
  const { wallet, getSignature } = useWebLogin();
  const [signInfo, setSignInfo] = useState('');
  const [signed, setSigned] = useState('');

  const sign = async () => {
    const signature = await getSignature({
      signInfo,
      appName: '',
      address: '',
    });
    console.log('signature', signature);
    setSigned(signature.signature);
  };

  return (
    <div>
      <div>
        <button disabled={!wallet.address} onClick={sign}>
          Sign
        </button>
        <input value={signInfo} onChange={e => setSignInfo(e.target.value)} />
      </div>
    </div>
  );
}
