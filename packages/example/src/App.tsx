import { WalletType, WebLoginEvents, WebLoginState, getConfig, useWebLogin, useWebLoginEvent } from 'aelf-web-login';
import VConsole from 'vconsole';
import MultiWallets from './components/MultiWallets';
import CallContract from './components/CallContract';
import { useCallback, useMemo, useState } from 'react';
import { usePortkeyLock, usePortkeyLockV1 } from 'aelf-web-login';
import { Tabs } from 'antd';
import isMobile from './utils/isMobile';
import Signature from './components/Signature';
import Events from './components/Events';
import { changeGlobalConfig } from './config';

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
  const { wallet, walletType, login, loginEagerly, logout, loginState, changeVersion } = useWebLogin();

  const [version, setVersion] = useState(config.version);

  const { isUnlocking, lock } = version?.portkey === 1 ? usePortkeyLockV1() : usePortkeyLock();

  useWebLoginEvent(WebLoginEvents.CHANGE_PORTKEY_VERSION, () => {
    changeGlobalConfig({ version });
  });
  console.log(version, '===version===');

  const changeConfig = useCallback(async () => {
    console.log(version, 'version');
    setVersion({
      portkey: 2 - ((version?.portkey + 1) % 2),
    });
    changeVersion();
  }, [version]);

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
        <button disabled={loginState !== WebLoginState.eagerly} onClick={loginEagerly}>
          loginEagerly
        </button>
        <button disabled={loginState !== WebLoginState.logined || walletType !== WalletType.portkey} onClick={lock}>
          lock
        </button>
        <button disabled={loginState !== WebLoginState.lock} onClick={login}>
          {isUnlocking ? 'unlocking' : 'unlock'}
        </button>
        <button disabled={loginState !== WebLoginState.logined} onClick={() => logout()}>
          {loginState === WebLoginState.logouting ? 'logouting' : 'logout'}
        </button>
        <button disabled={loginState !== WebLoginState.logined} onClick={() => logout({ noModal: true })}>
          {loginState === WebLoginState.logouting ? 'logouting' : 'logoutNoModal'}
        </button>
        <button onClick={() => changeConfig()}>changeGlobalConfig</button>
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
