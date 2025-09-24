import { Drawer, Modal } from 'antd';
import { useCallback, useMemo } from 'react';
import useMobile from '../../hooks/useMobile';
import { useModal } from '../../useModal';
import './index.css';
import { basicModalView } from '../../useModal/actions';
import { useWebLoginContext } from '../../context';
import {
  NIGHT_ELF_WALLET,
  PORTKEY_DISCOVER,
  PORTKEY_WEB_WALLET,
  FAIRY_VAULT_DISCOVER,
  // FAIRY_VAULT_WEB_WALLET,
} from '@aelf-web-login/wallet-adapter-base';
import { CLOSE_ICON } from '../../assets/icon';

const walletMap: { [x in string]: string } = {
  [PORTKEY_WEB_WALLET]: 'Portkey SDK',
  [PORTKEY_DISCOVER]: 'Portkey Wallet',
  [NIGHT_ELF_WALLET]: 'aelf Wallet',
  [FAIRY_VAULT_DISCOVER]: 'FairyVault Wallet',
  // [FAIRY_VAULT_WEB_WALLET]: 'FairyVault SDK',
};

export default function WalletModal() {
  const [{ dialogVisible }, { dispatch }] = useModal();
  const { instance, extraElementInConnectModal } = useWebLoginContext();
  const isMobile = useMobile();

  const onCancel = useCallback(() => {
    dispatch(basicModalView.setWalletDialog.actions(false, { errorMessage: 'user cancel' }));
  }, [dispatch]);

  const inner = useMemo(
    () => (
      <div>
        <div className="web-login-page-close-wrap">
          <div className="connect-wallet-close-inner" onClick={onCancel}>
            <img
              className="connect-wallet-close-image"
              src={instance.theme === 'dark' ? CLOSE_ICON['dark'] : CLOSE_ICON['light']}
            />
          </div>
        </div>
        <div className="web-login-list">
          <div className="web-login-connect-text">Connect wallet</div>
          <div className="web-login-wallet-list">
            {instance._wallets.map((item) => (
              <div
                key={item.name}
                className="web-login-wallet-item"
                onClick={() => {
                  dispatch(basicModalView.setWalletDialog.actions(false, { name: item.name }));
                }}
              >
                <img src={item.icon} />
                <div>{walletMap[item.name] ?? '--'}</div>
              </div>
            ))}
          </div>
          {extraElementInConnectModal}
        </div>
      </div>
    ),
    [dispatch, extraElementInConnectModal, instance._wallets, instance.theme, onCancel],
  );

  const commonCls = useMemo(
    () =>
      `web-login-connect-wallet-modal ${instance.theme === 'dark' ? 'web-login-connect-wallet-modal-dark' : ''}`,
    [instance.theme],
  );

  return isMobile ? (
    <Drawer
      closable={false}
      className={commonCls}
      placement="bottom"
      height="auto"
      open={dialogVisible}
      onClose={onCancel}
    >
      {inner}
    </Drawer>
  ) : (
    <Modal
      prefixCls="web-login-connect-modal"
      className={commonCls}
      wrapClassName="web-login-connect-wallet-modal-wrapper"
      open={dialogVisible}
      centered
      style={{ height: 700 }}
      footer={null}
      closable={false}
      onCancel={onCancel}
    >
      {inner}
    </Modal>
  );
}
