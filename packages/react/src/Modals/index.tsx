import { ConfigProvider } from 'antd';
import WalletDisconnectModal from './disconnectModal';
import WalletModal from './WalletModal';
// import './antd.rewrite.css';

export default function Modals() {
  return (
    <ConfigProvider prefixCls="web-login-connect">
      <WalletModal />
      <WalletDisconnectModal />
    </ConfigProvider>
  );
}
