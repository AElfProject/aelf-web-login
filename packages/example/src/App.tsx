import VConsole from 'vconsole';
import { useState } from 'react';
import { Button, Tabs } from 'antd';
import isMobile from './utils/isMobile';
import { usePortkeyUISDK } from '@aelf-web-login/react';

const win = window as any;
let showVConsole = () => {};
if (isMobile() || win.ReactNativeWebView) {
  const vConsole = new VConsole();
  showVConsole = () => {
    vConsole.show();
  };
}

export default function App() {
  const portkeySDK = usePortkeyUISDK();

  return (
    <div className="example-app">
      <div>
        <Button onClick={showVConsole}>Show VConsole</Button>
        <Button onClick={() => portkeySDK.login()}>Login</Button>
      </div>
    </div>
  );
}
