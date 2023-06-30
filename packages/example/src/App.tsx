import { Tab } from '@headlessui/react';
import { WalletType, WebLoginEvents, WebLoginState, getConfig, useWebLogin, useWebLoginEvent } from 'aelf-web-login';
import VConsole from 'vconsole';
import MultiWallets from './components/MultiWallets';
import CallContract from './components/CallContract';
import ExampleTab from './components/base/ExampleTab';
import { useState } from 'react';
import { usePortkeyLock } from 'aelf-web-login';

const win = window as any;
let showVConsole = () => {};
if (win.ReactNativeWebView) {
  const vConsole = new VConsole();
  showVConsole = () => {
    vConsole.show();
  };
}

function renderEvents() {
  const [events, setEvents] = useState([]);
  for (const key in WebLoginEvents) {
    useWebLoginEvent(WebLoginEvents[key], (data: any) => {
      console.log(WebLoginEvents[key], data);
      events.push({
        type: key,
        data,
      });
      setEvents([...events]);
    });
  }
  return (
    <>
      <h2>Events: </h2>
      <div>
        <div className="result">
          {events.map((item, index) => {
            return <div key={`${item.type}-${index}`}>{`${item.type} ${JSON.stringify(item.data)}`}</div>;
          })}
        </div>
      </div>
    </>
  );
}

export default function App() {
  const config = getConfig();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { wallet, walletType, login, loginEagerly, logout, loginState } = useWebLogin();
  const { isUnlocking, lock } = usePortkeyLock();

  return (
    <div>
      <h2 onClick={showVConsole}>Login</h2>
      <div className="buttons">
        <div>
          wallet: {wallet.name} {wallet.address}
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
        <button disabled={loginState !== WebLoginState.logined} onClick={logout}>
          {loginState === WebLoginState.logouting ? 'logouting' : 'logout'}
        </button>
      </div>
      {renderEvents()}
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <ExampleTab>useMultiWallets</ExampleTab>
          <ExampleTab>callContract</ExampleTab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel>
            <MultiWallets />
          </Tab.Panel>
          <Tab.Panel>
            <CallContract />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
