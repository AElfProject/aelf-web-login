import { Tab } from '@headlessui/react';
import { WebLoginState, getConfig, useWebLogin } from 'aelf-web-login';
import VConsole from 'vconsole';
import MultiWallets from './components/MultiWallets';
import CallContract from './components/CallContract';
import ExampleTab from './components/base/ExampleTab';
import { useState } from 'react';

const win = window as any;
let showVConsole = () => {};
if (win.ReactNativeWebView) {
  const vConsole = new VConsole();
  showVConsole = () => {
    vConsole.show();
  };
}

export default function App() {
  const config = getConfig();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { wallet, login, loginEagerly, logout, loginState, loginError, callContract, getSignature } = useWebLogin();
  return (
    <div>
      <h2 onClick={showVConsole}>Login</h2>
      <div className="buttons">
        <div>
          wallet: {wallet.name} {wallet.address}
        </div>
        <div>login state: {loginState}</div>
        <div>{loginError && <div>{/* login error: {loginError.message} */}</div>}</div>
        <br />
        <button disabled={loginState !== WebLoginState.initial} onClick={login}>
          login
        </button>
        <button disabled={loginState !== WebLoginState.eagerly} onClick={loginEagerly}>
          loginEagerly
        </button>
        <button disabled={loginState !== WebLoginState.lock} onClick={login}>
          unlock
        </button>
        <button disabled={loginState !== WebLoginState.logined} onClick={logout}>
          {loginState === WebLoginState.logouting ? 'logouting' : 'logout'}
        </button>
      </div>
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
