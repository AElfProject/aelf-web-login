import React, { useMemo } from 'react';
import { Modal, Button, Row } from 'antd';
import isMobile from '../../utils/isMobile';

export interface ConfirmLogoutDialogProps {
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
  okTxt: 'I Understand，Confirm Exit',
  cancelTxt: 'Cancel',
  visible: false,
  onOk: () => void 0,
  onCancel: () => void 0,
  width: 430,
  mobileWidth: 343,
};

export default function ConfirmLogoutDialog(props: Partial<ConfirmLogoutDialogProps>) {
  const { title, subTitle, okTxt, cancelTxt, visible, onOk, onCancel, width, mobileWidth } = {
    ...defaultProps,
    ...props,
  };

  const isMobileDevice = isMobile();

  const renderContent = useMemo(
    () =>
      subTitle?.map((t) => (
        <Row key={t} className="aelf-web-logout-dialog-sub-title">
          {t}
        </Row>
      )),
    [subTitle],
  );

  const bodyStyle = useMemo(
    () => ({
      borderRadius: isMobileDevice ? '8px' : '6px',
      padding: '0',
    }),
    [isMobileDevice],
  );

  return (
    <Modal
      footer={null}
      title={null}
      open={visible}
      width={isMobileDevice ? mobileWidth : width}
      bodyStyle={bodyStyle}
      closable={false}>
      <Row className="aelf-web-logout-dialog">
        <Row className={`aelf-web-logout-dialog-content ${isMobileDevice && 'aelf-web-logout-dialog-content-mobile'}`}>
          <Row className="aelf-web-logout-dialog-close" onClick={onCancel}>
            <i />
          </Row>
          <Row className="aelf-web-logout-dialog-title">{title}</Row>
          {renderContent}
        </Row>
        <Row className={`aelf-web-logout-dialog-content ${isMobileDevice && 'aelf-web-logout-dialog-content-mobile'}`}>
          <Button className="aelf-web-logout-dialog-btn ok-btn" onClick={onOk}>
            {okTxt}
          </Button>
          <Button className="aelf-web-logout-dialog-btn cancel-btn" onClick={onCancel}>
            {cancelTxt}
          </Button>
        </Row>
      </Row>
    </Modal>
  );
}
