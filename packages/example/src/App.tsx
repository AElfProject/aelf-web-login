import VConsole from 'vconsole';
import { useState } from 'react';
import { Tabs } from 'antd';
import isMobile from './utils/isMobile';

const win = window as any;
let showVConsole = () => {};
if (isMobile() || win.ReactNativeWebView) {
  const vConsole = new VConsole();
  showVConsole = () => {
    vConsole.show();
  };
}

export default function App() {
  return <div></div>;
}
