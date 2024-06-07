import React, { useCallback, useMemo, useState } from 'react';
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
import { Modal, Button, Typography, Drawer } from 'antd';
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

const defaultPropsForSocialDesign = {
  titleForSocialDesign: 'Crypto wallet',
  iconSrcForSocialDesign:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IkVsZiBFeHBsb3JlciI+CjxyZWN0IHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgZmlsbD0id2hpdGUiLz4KPHBhdGggaWQ9IlNoYXBlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLjAwMDMgMTEuODQyQzMzLjEwNjkgMTEuODQyIDM1LjYyNTIgOS4zMjM3MSAzNS42MjUyIDYuMjE3MTlDMzUuNjI1MiAzLjExMDY4IDMzLjEwNjkgMC41OTIzNDYgMzAuMDAwMyAwLjU5MjM0NkMyNi44OTM4IDAuNTkyMzQ2IDI0LjM3NTUgMy4xMTA2OCAyNC4zNzU1IDYuMjE3MTlDMjQuMzc1NSA5LjMyMzcxIDI2Ljg5MzggMTEuODQyIDMwLjAwMDMgMTEuODQyWk01NS40MDkzIDI4LjAzNzhDNTUuNDA5MyAzNC4zNTc5IDUwLjI4NTggMzkuNDgxNCA0My45NjU3IDM5LjQ4MTRDMzcuNjQ1NSAzOS40ODE0IDMyLjUyMiAzNC4zNTc5IDMyLjUyMiAyOC4wMzc4QzMyLjUyMiAyMS43MTc2IDM3LjY0NTUgMTYuNTk0MSA0My45NjU3IDE2LjU5NDFDNTAuMjg1OCAxNi41OTQxIDU1LjQwOTMgMjEuNzE3NiA1NS40MDkzIDI4LjAzNzhaTTM1LjYyNTIgNDkuODU4MkMzNS42MjUyIDUyLjk2NDggMzMuMTA2OSA1NS40ODMxIDMwLjAwMDMgNTUuNDgzMUMyNi44OTM4IDU1LjQ4MzEgMjQuMzc1NSA1Mi45NjQ4IDI0LjM3NTUgNDkuODU4MkMyNC4zNzU1IDQ2Ljc1MTcgMjYuODkzOCA0NC4yMzM0IDMwLjAwMDMgNDQuMjMzNEMzMy4xMDY5IDQ0LjIzMzQgMzUuNjI1MiA0Ni43NTE3IDM1LjYyNTIgNDkuODU4MlpNMS4xOTczMyAxMi4yM0MtMC40NTEzMzEgMTYuNTk0MSAxLjg3NjE5IDIxLjU0MDEgNi4yNDAzIDIzLjE4ODdDOS4xNDk3IDI0LjI1NTUgMTIuMjUzMSAyMy42NzM2IDE0LjQ4MzYgMjEuODMxQzE2LjUyMDIgMjAuMzc2MyAxOS4xMzg3IDE5Ljg5MTQgMjEuNjYwMSAyMC44NjEyQzIzLjMwODggMjEuNDQzMSAyNC41Njk1IDIyLjUwOTkgMjUuNDQyNCAyMy44Njc2TDI1LjUzOTMgMjQuMDYxNUMyNS45MjczIDI0LjY0MzQgMjYuNTA5MSAyNS4yMjUzIDI3LjI4NSAyNS40MTkzQzI5LjAzMDYgMjYuMDk4MSAzMS4wNjcyIDI1LjEyODMgMzEuNjQ5MSAyMy4zODI3QzMyLjMyOCAyMS42MzcgMzEuMzU4MiAxOS42MDA1IDI5LjYxMjUgMTkuMDE4NkMyOC44MzY3IDE4LjcyNzYgMjguMDYwOCAxOC43Mjc2IDI3LjI4NSAxOS4wMTg2QzI1LjczMzMgMTkuNTAzNSAyMy45ODc3IDE5LjUwMzUgMjIuMzM5IDE4LjkyMTZDMTkuOTE0NSAxOC4wNDg4IDE4LjI2NTggMTYuMTA5MiAxNy41ODcgMTMuODc4NkwxNy40OSAxMy42ODQ3QzE3LjQ5IDEzLjU4NzcgMTcuNDkgMTMuNDkwNyAxNy4zOTMgMTMuNDkwN1YxMy4yOTY4QzE2LjcxNDIgMTAuNTgxMyAxNC44NzE1IDguMjUzNzggMTIuMDU5MSA3LjI4Mzk4QzcuNjk1IDUuNTM4MzQgMi43NDkwMSA3Ljc2ODg4IDEuMTk3MzMgMTIuMjNaTTYuMjQwMyAzMi44ODY4QzEuODc2MTkgMzQuNTM1NCAtMC40NTEzMzEgMzkuNDgxNCAxLjE5NzMzIDQzLjg0NTVDMi44NDU5OSA0OC4zMDY2IDcuNjk1IDUwLjUzNzIgMTIuMDU5MSA0OC43OTE1QzE0Ljg3MTUgNDcuODIxNyAxNi43MTQyIDQ1LjQ5NDIgMTcuMzkzIDQyLjc3ODdWNDIuNTg0OEMxNy40OSA0Mi41ODQ4IDE3LjQ5IDQyLjQ4NzggMTcuNDkgNDIuMzkwOEwxNy41ODcgNDIuMTk2OUMxOC4yNjU4IDM5Ljk2NjMgMTkuOTE0NSAzOC4wMjY3IDIyLjMzOSAzNy4xNTM5QzIzLjk4NzcgMzYuNTcyIDI1LjczMzMgMzYuNTcyIDI3LjI4NSAzNy4wNTY5QzI4LjA2MDggMzcuMzQ3OSAyOC44MzY3IDM3LjM0NzkgMjkuNjEyNSAzNy4wNTY5QzMxLjM1ODIgMzYuNDc1IDMyLjMyOCAzNC40Mzg1IDMxLjY0OTEgMzIuNjkyOEMzMS4wNjcyIDMwLjk0NzIgMjkuMDMwNiAyOS45Nzc0IDI3LjI4NSAzMC42NTYyQzI2LjUwOTEgMzAuODUwMiAyNS45MjczIDMxLjQzMjEgMjUuNTM5MyAzMi4wMTRMMjUuNDQyNCAzMi4yMDc5QzI0LjU2OTUgMzMuNTY1NiAyMy4zMDg4IDM0LjYzMjQgMjEuNjYwMSAzNS4yMTQzQzE5LjEzODcgMzYuMTg0MSAxNi41MjAyIDM1LjY5OTIgMTQuNDgzNiAzNC4yNDQ1QzEyLjI1MzEgMzIuNDAxOSA5LjE0OTcgMzEuODIgNi4yNDAzIDMyLjg4NjhaIiBmaWxsPSIjMjY2Q0QzIi8+CjwvZz4KPC9zdmc+Cg==',
};

const constant = {
  leftImg:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9ImRpcmVjdGlvbi9sZWZ0Ij4KPGcgaWQ9IlVuaW9uIj4KPHBhdGggZD0iTTcuOTA5NjUgMTIuMDAyMkwxNS40NDc0IDE5LjU0QzE1LjU2NDYgMTkuNjU3MSAxNS41NjQ2IDE5Ljg0NzEgMTUuNDQ3NCAxOS45NjQzTDE0LjM4NjggMjEuMDI0OUMxNC4yNjk2IDIxLjE0MjEgMTQuMDc5NiAyMS4xNDIxIDEzLjk2MjUgMjEuMDI0OUw1LjQ2OTY3IDEyLjUzMjFDNS4xNzY3OCAxMi4yMzkyIDUuMTc2NzggMTEuNzY0MyA1LjQ2OTY3IDExLjQ3MTRMMTMuOTYzNSAyLjk3ODQ5QzE0LjA4MDcgMi44NjEzNCAxNC4yNzA2IDIuODYxMzQgMTQuMzg3OCAyLjk3ODQ5TDE1LjQ0ODUgNC4wMzkxNUMxNS41NjU2IDQuMTU2MzEgMTUuNTY1NiA0LjM0NjI2IDE1LjQ0ODUgNC40NjM0Mkw3LjkwOTY1IDEyLjAwMjJaIiBmaWxsPSIjNTE1QTYyIi8+CjwvZz4KPC9nPgo8L3N2Zz4K',
  rightImg:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9Ikljb24gLyBMaW5lIC8gTGVmdCYjMjI5OyYjMTY0OyYjMTM1OyYjMjI4OyYjMTg3OyYjMTg5OyI+CjxwYXRoIGlkPSJTaGFwZSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zIDExLjEzOThWMTAuMTAzNkMzIDEwLjAzMzIgMy4wMjkzIDkuOTY2ODQgMy4wNzczNCA5LjkyNTM5TDcuNjY2NDEgNi4wMDAyNkwzLjA3NzM0IDIuMDc1MTNDMy4wMjkzIDIuMDMzNjggMyAxLjk2NzM3IDMgMS44OTY5VjAuODYwNzAzQzMgMC43NzA4OTkgMy4wODY3MiAwLjcxODM5OCAzLjE0ODgzIDAuNzcwODk5TDguODQ1MzEgNS42NDI0M0M5LjA1MTU2IDUuODE5MjcgOS4wNTE1NiA2LjE4MTI1IDguODQ1MzEgNi4zNTY3MkwzLjE0ODgzIDExLjIyODJDMy4wODY3MiAxMS4yODIxIDMgMTEuMjI5NiAzIDExLjEzOThaIiBmaWxsPSIjNTE1QTYyIi8+CjwvZz4KPC9zdmc+Cg==',
  closeImg:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9InN1Z2dlc3QvY2xvc2UiPgo8ZyBpZD0iVW5pb24iPgo8cGF0aCBkPSJNNC42MDgwNyAxNi42Mjg0QzQuNTEwNDQgMTYuNzI2IDQuMzUyMTUgMTYuNzI2IDQuMjU0NTIgMTYuNjI4NEwzLjM3MDY0IDE1Ljc0NDVDMy4yNzMwMSAxNS42NDY4IDMuMjczMDEgMTUuNDg4NSAzLjM3MDY0IDE1LjM5MDlMOC43NjIyOSA5Ljk5OTI2TDMuMzcwNTkgNC42MDc1NkMzLjI3Mjk2IDQuNTA5OTMgMy4yNzI5NiA0LjM1MTY0IDMuMzcwNTkgNC4yNTQwMUw0LjI1NDQ3IDMuMzcwMTJDNC4zNTIxIDMuMjcyNDkgNC41MTAzOSAzLjI3MjQ5IDQuNjA4MDIgMy4zNzAxMkw5Ljk5OTczIDguNzYxODNMMTUuMzkxNSAzLjM3MDFDMTUuNDg5MSAzLjI3MjQ3IDE1LjY0NzQgMy4yNzI0NyAxNS43NDUgMy4zNzAxTDE2LjYyODkgNC4yNTM5OEMxNi43MjY1IDQuMzUxNjEgMTYuNzI2NSA0LjUwOTkgMTYuNjI4OSA0LjYwNzU0TDExLjIzNzIgOS45OTkyNkwxNi42Mjg4IDE1LjM5MDlDMTYuNzI2NSAxNS40ODg2IDE2LjcyNjUgMTUuNjQ2OSAxNi42Mjg4IDE1Ljc0NDVMMTUuNzQ1IDE2LjYyODRDMTUuNjQ3MyAxNi43MjYgMTUuNDg5IDE2LjcyNiAxNS4zOTE0IDE2LjYyODRMOS45OTk3MyAxMS4yMzY3TDQuNjA4MDcgMTYuNjI4NFoiIGZpbGw9IiM1MTVBNjIiLz4KPC9nPgo8L2c+Cjwvc3ZnPgo=',
  connectWallet: 'Connect Wallet',
};

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
            <div className="aelf-web-logout-dialog-title">{title}</div>
          </div>

          <div>
            {subTitle?.map((t) => (
              <div
                key={t}
                className="aelf-web-logout-dialog-sub-title aelf-web-logout-dialog-mt-12"
              >
                {t}
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

interface IDynamicWrapperProps {
  onCloseHandler: () => void;
  noCommonBaseModal: boolean;
}
const DynamicWrapper = ({
  children,
  onCloseHandler,
  noCommonBaseModal,
}: React.PropsWithChildren<IDynamicWrapperProps>) => {
  return noCommonBaseModal ? (
    <div>{children}</div>
  ) : (
    <CommonBaseModal
      destroyOnClose
      // className={clsx('portkey-ui-sign-modal', `portkey-ui-sign-modal-${portkeyOpts.design}`)}
      // maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      open={true}
      onClose={onCloseHandler}
    >
      {children}
    </CommonBaseModal>
  );
};

interface INestedModalProps {
  open: boolean;
  onClose: () => void;
  bridgeInstance: Bridge;
  design?: string;
  validWallets: WalletAdapter[];
}
const NestedModal = ({
  open,
  onClose,
  validWallets,
  design,
  bridgeInstance,
}: INestedModalProps) => {
  const isMobileDevice = isMobile();
  const isWeb2Design = design === 'Web2Design';

  const validWalletList = validWallets.map((wallet) => {
    return (
      <div
        key={wallet.name}
        className="nested-wallet-wrapper"
        onClick={() => bridgeInstance.onUniqueWalletClick(wallet.name)}
      >
        <img src={wallet.icon} />
        <Typography.Text>{wallet.name}</Typography.Text>
      </div>
    );
  });

  return isMobileDevice ? (
    <Drawer
      className="aelf-web-conntect-drawer"
      title={
        <div className="nested-drawer-title-wrapper">
          <span className="title">Connect Wallet</span>
          <img src={constant.closeImg} onClick={onClose}></img>
        </div>
      }
      getContainer={false}
      closeIcon={null}
      onClose={onClose}
      prefixCls="portkey-ant-drawer"
      open={open}
      placement={'bottom'}
    >
      <div className="nested-entry-wrapper nested-entry-wrapper-mobile">{validWalletList}</div>
    </Drawer>
  ) : (
    <Modal
      title={
        <>
          <div
            className={`aelf-web-logout-dialog-title ${
              isWeb2Design ? 'nested-title-12' : 'nested-title'
            }`}
          >
            {constant.connectWallet}
          </div>

          {isWeb2Design ? (
            <img className="nested-close-icon" src={constant.closeImg} onClick={onClose}></img>
          ) : (
            <img className="nested-left-icon" src={constant.leftImg} onClick={onClose}></img>
          )}
        </>
      }
      getContainer={false}
      open={open}
      closable={false}
      footer={null}
      centered={true}
      className="nested-connect-modal"
      prefixCls="portkey-ant-modal"
      width={430}
    >
      <div className="nested-entry-wrapper">{validWalletList}</div>
    </Modal>
  );
};

const SignInModal = (props: ISignInModalProps) => {
  const { bridgeInstance, wallets, baseConfig } = props;
  const [isShowWrapper, setIsShowWrapper] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShowLockPanel, setIsShowLockPanel] = useState(false);
  const [password, setPassword] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [isShowConfirmLogoutPanel, setIsShowConfirmLogoutPanel] = useState(false);
  const [isShowNestedModal, setIsShowNestedModal] = useState(false);
  const filteredWallets = wallets.filter((ele) => ele.name !== 'PortkeyAA');

  const isMobileDevice = isMobile();
  const { noCommonBaseModal = false } = baseConfig;

  bridgeInstance.openLoginPanel = () => {
    setIsShowWrapper(true);
  };

  bridgeInstance.closeLoginPanel = () => {
    setIsShowWrapper(false);
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

  bridgeInstance.closeNestedModal = () => {
    setIsShowNestedModal(false);
  };

  const onFinishInternal = useCallback(
    (didWallet: DIDWalletInfo) => {
      bridgeInstance.onPortkeyAAWalletLoginFinished(didWallet);
    },
    [bridgeInstance],
  );

  const onCloseWrapperInternal = useCallback(() => {
    setIsShowNestedModal(false);
    setIsShowWrapper(false);
  }, []);

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

  const extraWallets = useMemo(() => {
    if (baseConfig.design === 'SocialDesign') {
      return (
        <div className="aelf-web-extra-wallets-wrapper-social">
          <div className="social-design-wallets">
            <div className="title-icon">
              <img
                src={
                  baseConfig?.iconSrcForSocialDesign ||
                  defaultPropsForSocialDesign.iconSrcForSocialDesign
                }
              ></img>
            </div>
            <div className="aelf-web-logout-dialog-title">
              {baseConfig?.titleForSocialDesign || defaultPropsForSocialDesign.titleForSocialDesign}
            </div>
          </div>
          <div className="social-design-wallets">
            {filteredWallets.map((item) => (
              <div
                className="social-design-wallet-wrapper"
                onClick={() => bridgeInstance.onUniqueWalletClick(item.name)}
                key={item.name}
              >
                <img src={item.icon} />
                <div className="aelf-web-logout-dialog-sub-title">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <>
          <div className="aelf-web-extra-wallets-wrapper-crypto">
            <Typography.Text className="crypto-wallets-title">Crypto wallet</Typography.Text>
            <div
              className={`crypto-extra-wallets ${
                baseConfig.design === 'Web2Design' && 'web2-extra-wallets'
              }`}
              onClick={() => {
                setIsShowNestedModal(true);
              }}
            >
              <Typography.Text className="crypto-extra-wallets-left">
                {constant.connectWallet}
              </Typography.Text>
              <div className="crypto-extra-image">
                {filteredWallets.map((item) => (
                  <img key={item.name} src={item.icon} />
                ))}
                <img className="crypto-extra-image-arrow" src={constant.rightImg} />
              </div>
            </div>
          </div>
          <NestedModal
            open={isShowNestedModal}
            onClose={() => {
              setIsShowNestedModal(false);
            }}
            design={baseConfig.design}
            bridgeInstance={bridgeInstance}
            validWallets={filteredWallets}
          />
        </>
      );
    }
  }, [
    baseConfig.design,
    baseConfig?.iconSrcForSocialDesign,
    baseConfig?.titleForSocialDesign,
    bridgeInstance,
    filteredWallets,
    isShowNestedModal,
  ]);

  return (
    <PortkeyProvider networkType={baseConfig.networkType} theme="dark">
      <div>
        {!isShowWrapper ? null : isShowLockPanel ? (
          <Unlock
            className="web-login-unlock-wrapper"
            open={true}
            value={password}
            isWrongPassword={isWrongPassword}
            keyboard={baseConfig.keyboard}
            onChange={setPassword}
            onCancel={onCloseWrapperInternal}
            onUnlock={onUnlockInternal}
          />
        ) : (
          <DynamicWrapper
            onCloseHandler={onCloseWrapperInternal}
            noCommonBaseModal={noCommonBaseModal}
          >
            <SignIn
              defaultChainId={baseConfig.chainId}
              uiType="Full"
              design={baseConfig.design}
              isShowScan
              extraElementList={[extraWallets]}
              onCancel={() => {
                //TODO: seem to not execute
                console.log('onSignInCancel');
              }}
              onError={() => {
                console.log('onSignInInternalError');
              }}
              onFinish={onFinishInternal}
            />
          </DynamicWrapper>
        )}

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
