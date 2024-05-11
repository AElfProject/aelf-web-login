import React, { useCallback, useState } from 'react';
import { WalletAdapter, utils } from '@aelf-web-login/wallet-adapter-base';
import { Bridge } from './bridge';
import {
  CommonBaseModal,
  PortkeyLoading,
  PortkeyProvider,
  SignIn,
  Unlock,
  DIDWalletInfo,
} from '@portkey/did-ui-react';
import '@portkey/did-ui-react/dist/assets/index.css';
import { IBaseConfig } from '.';
import { Modal, Button, Typography, FontWeightEnum } from 'aelf-design';
import './ui.css';

interface ConfirmLogoutDialogProps {
  title: string;
  subTitle: string[];
  okTxt: string;
  cancelTxt: string;
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  width: number;
  mobileWidth: number;
}

const defaultProps: Partial<ConfirmLogoutDialogProps> = {
  title: 'Are you sure you want to exit your wallet?',
  subTitle: [
    'Your current wallet and assets will be removed from this app permanently. This action cannot be undone.',
    'You can ONLY recover this wallet with your guardians.',
  ],
  okTxt: 'I Understand, Confirm Exit',
  cancelTxt: 'Cancel',
  visible: false,
  onOk: () => void 0,
  onCancel: () => void 0,
  width: 430,
  mobileWidth: 343,
};

interface ISignInModalProps {
  bridgeInstance: Bridge;
  wallets: WalletAdapter[];
  baseConfig: IBaseConfig;
}
const { isMobile } = utils;

const ConfirmLogoutDialog = (props: Partial<ConfirmLogoutDialogProps>) => {
  const { title, subTitle, okTxt, cancelTxt, visible, onOk, onCancel, width, mobileWidth } = {
    ...defaultProps,
    ...props,
  };
  const isMobileDevice = isMobile();

  return (
    <Modal
      footer={null}
      open={visible}
      width={isMobileDevice ? mobileWidth : width}
      onCancel={onCancel}
    >
      <>
        <div>
          <div className="aelf-web-logout-dialog-title-wrap">
            <Typography.Title
              className="aelf-web-logout-dialog-title"
              fontWeight={FontWeightEnum.Bold}
              level={5}
            >
              {title}
            </Typography.Title>
          </div>

          <div>
            {subTitle?.map((t) => (
              <div key={t} className="aelf-web-logout-dialog-sub-title">
                <Typography.Title level={7}>{t}</Typography.Title>
              </div>
            ))}
          </div>
        </div>
        <div className="aelf-web-logout-dialog-btn-wrap">
          <Button type="primary" danger onClick={onOk}>
            {okTxt}
          </Button>
          <Button type="primary" ghost onClick={onCancel}>
            {cancelTxt}
          </Button>
        </div>
      </>
    </Modal>
  );
};

const SignInModal = (props: ISignInModalProps) => {
  const { bridgeInstance, wallets, baseConfig } = props;
  const [isShowModal, setIsShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShowLockPanel, setIsShowLockPanel] = useState(false);
  const [password, setPassword] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [isShowConfirmLogoutPanel, setIsShowConfirmLogoutPanel] = useState(false);

  const isMobileDevice = isMobile();

  bridgeInstance.openSignInModal = () => {
    setIsShowModal(true);
  };

  bridgeInstance.closeSignIModal = () => {
    setIsShowModal(false);
  };

  bridgeInstance.openLoadingModal = () => {
    setLoading(true);
  };

  bridgeInstance.closeLoadingModal = () => {
    setLoading(false);
  };

  bridgeInstance.openLockPanel = () => {
    setIsShowLockPanel(true);
  };

  bridgeInstance.closeLockPanel = () => {
    setIsShowLockPanel(false);
  };

  bridgeInstance.openConfirmLogoutPanel = () => {
    setIsShowConfirmLogoutPanel(true);
  };

  bridgeInstance.closeConfirmLogoutPanel = () => {
    setIsShowConfirmLogoutPanel(false);
  };

  const onFinishInternal = useCallback(
    (didWallet: DIDWalletInfo) => {
      bridgeInstance.onPortkeyAAWalletLoginFinished(didWallet);
    },
    [bridgeInstance],
  );

  const confirmLogoutHandler = useCallback(() => {
    bridgeInstance.disConnect(true);
  }, [bridgeInstance]);

  const cancelLogoutHandler = useCallback(() => {
    bridgeInstance.closeConfirmLogoutPanel();
  }, [bridgeInstance]);

  const onUnlockInternal = useCallback(
    async (pin: string) => {
      const success = await bridgeInstance.onPortkeyAAUnLock(pin);
      if (!success) {
        setIsWrongPassword(true);
        if (isMobileDevice && baseConfig.keyboard) {
          setPassword('');
        }
      } else {
        setIsWrongPassword(false);
        setPassword('');
      }
    },
    [baseConfig.keyboard, bridgeInstance, isMobileDevice],
  );

  return (
    <PortkeyProvider networkType="TESTNET">
      <div>
        <CommonBaseModal
          destroyOnClose
          // className={clsx('portkey-ui-sign-modal', `portkey-ui-sign-modal-${portkeyOpts.design}`)}
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          open={isShowModal}
          onClose={() => {
            setIsShowModal(false);
          }}
        >
          {isShowLockPanel ? (
            <Unlock
              open={true}
              value={password}
              isWrongPassword={isWrongPassword}
              keyboard={baseConfig.keyboard}
              onChange={setPassword}
              onCancel={() => {
                setIsShowModal(false);
              }}
              onUnlock={onUnlockInternal}
            />
          ) : (
            <SignIn
              defaultChainId={baseConfig.chainId}
              uiType="Full"
              design={baseConfig.design}
              isShowScan
              extraElementList={wallets
                .filter((ele) => ele.name !== 'PortkeyAA')
                .map((item) => (
                  <div
                    key={item.name}
                    onClick={() => bridgeInstance.onUniqueWalletClick(item.name)}
                  >
                    {item.name}
                  </div>
                ))}
              onCancel={() => {
                //TODO: seem to not execute
                console.log('onSignInCancel');
              }}
              onError={() => {
                console.log('onSignInInternalError');
              }}
              onFinish={onFinishInternal}
            />
          )}
        </CommonBaseModal>
        <ConfirmLogoutDialog
          visible={isShowConfirmLogoutPanel}
          onOk={confirmLogoutHandler}
          onCancel={cancelLogoutHandler}
        />
        <PortkeyLoading loading={loading} />
      </div>
    </PortkeyProvider>
  );
};

export default SignInModal;
