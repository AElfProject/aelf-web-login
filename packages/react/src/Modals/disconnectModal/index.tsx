import { Button, Drawer, Modal } from 'antd';
import { useCallback, useMemo } from 'react';
import useMobile from '../../hooks/useMobile';
import { useModal } from '../../useModal';
import { basicModalView } from '../../useModal/actions';
import { useWebLoginContext } from '../../context';
import { CLOSE_ICON, TIP_ICON } from '../../assets/icon';
import './index.css';

const defaultProps = {
  title: 'Confirm sign out',
  subTitle: [
    'Your assets will remain safe in your account and accessible next time you log in via social recovery.',
  ],
  okTxt: 'Sign out',
  cancelTxt: 'Cancel',
  visible: false,
  onOk: () => void 0,
  onCancel: () => void 0,
  width: 400,
  mobileWidth: 343,
};

export default function WalletDisconnectModal() {
  const [{ disconnectModal }, { dispatch }] = useModal();
  const { instance } = useWebLoginContext();
  const isMobile = useMobile();

  const onCancel = useCallback(() => {
    dispatch(basicModalView.setDisconnectDialogVisible.actions(false, false));
  }, [dispatch]);

  const onSignOut = useCallback(() => {
    dispatch(basicModalView.setDisconnectDialogVisible.actions(false, true));
  }, [dispatch]);

  console.log(disconnectModal, 'disconnectModal===');

  const inner = useMemo(
    () => (
      <div>
        <div>
          <div className="aelf-web-logout-dialog-header">
            <img src={instance.theme === 'dark' ? TIP_ICON['dark'] : TIP_ICON['light']} />
            <img
              src={instance.theme === 'dark' ? CLOSE_ICON['dark'] : CLOSE_ICON['light']}
              onClick={onCancel}
            />
          </div>
          <div className="aelf-web-logout-dialog-title-wrap">
            <div className="aelf-web-logout-dialog-title aelf-web-logout-dialog-title-text">
              {defaultProps.title}
            </div>
          </div>

          <div>
            {defaultProps.subTitle.map((t) => (
              <div key={t} className="aelf-web-logout-dialog-sub-title">
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="aelf-web-logout-dialog-btn-wrap">
          <Button type="primary" ghost onClick={onCancel}>
            {defaultProps.cancelTxt}
          </Button>
          <Button type="primary" danger onClick={onSignOut}>
            {defaultProps.okTxt}
          </Button>
        </div>
      </div>
    ),
    [instance.theme, onCancel, onSignOut],
  );

  console.log(instance.theme, 'instance.theme==');

  const commonCls = useMemo(
    () =>
      `web-login-disconnect-wallet-modal ${instance.theme === 'dark' ? 'web-login-disconnect-wallet-modal-dark' : ''}`,
    [instance.theme],
  );

  return isMobile ? (
    <Drawer
      prefixCls="web-login-disconnect-modal"
      className={commonCls}
      placement="bottom"
      height="auto"
      open={disconnectModal}
    >
      {inner}
    </Drawer>
  ) : (
    <Modal
      prefixCls="web-login-disconnect-modal"
      className={commonCls}
      wrapClassName="web-login-disconnect-wallet-modal-wrapper"
      open={disconnectModal}
      centered
      style={{ width: 400 }}
      footer={null}
      closable={false}
    >
      {inner}
    </Modal>
  );
}
