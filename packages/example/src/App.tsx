import { WalletType, WebLoginState, getConfig, useWebLogin } from 'aelf-web-login-v2';
import VConsole from 'vconsole';
import MultiWallets from './components/MultiWallets';
import CallContract from './components/CallContract';
import { useState } from 'react';
import { usePortkeyLock } from 'aelf-web-login-v2';
import { Tabs } from 'antd';
import isMobile from './utils/isMobile';
import Signature from './components/Signature';
import Events from './components/Events';

const win = window as any;
let showVConsole = () => {};
if (isMobile() || win.ReactNativeWebView) {
  const vConsole = new VConsole();
  showVConsole = () => {
    vConsole.show();
  };
}

export default function App() {
  const config = getConfig();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { wallet, walletType, login, logout, loginState } = useWebLogin();
  const { isUnlocking, lock } = usePortkeyLock();

  return (
    <div>
      <h2 onClick={showVConsole}>Login</h2>
      <div className="buttons">
        <div>
          {getConfig().chainId} wallet: {wallet.name} {wallet.address}
        </div>
        <div>login state: {loginState}</div>
        <br />
        <button disabled={loginState !== WebLoginState.initial} onClick={login}>
          login
        </button>
        {/* <button disabled={loginState !== WebLoginState.eagerly} onClick={loginEagerly}>
          loginEagerly
        </button> */}
        {/* <button disabled={loginState !== WebLoginState.logined || walletType !== WalletType.portkey} onClick={lock}>
          lock
        </button> */}
        <button disabled={loginState !== WebLoginState.lock} onClick={login}>
          {isUnlocking ? 'unlocking' : 'unlock'}
        </button>
        <button disabled={loginState !== WebLoginState.logined} onClick={logout}>
          {loginState === WebLoginState.logouting ? 'logouting' : 'logout'}
        </button>
      </div>
      <Tabs
        type="card"
        items={[
          {
            label: 'Events',
            key: Events.name,
            children: <Events />,
          },
          {
            label: 'Call contracts',
            key: CallContract.name,
            children: <CallContract />,
          },
          {
            label: 'Use multiple wallets',
            key: MultiWallets.name,
            children: <MultiWallets />,
          },
          {
            label: 'Signature',
            key: Signature.name,
            children: <Signature />,
          },
        ]}
      />
    </div>
  );
}
