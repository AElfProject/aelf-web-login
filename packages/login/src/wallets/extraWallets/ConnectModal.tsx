import { Drawer, Modal } from 'antd';
import isMobile from '../../utils/isMobile';
import { CloseIcon, LeftIcon, WalletType } from '../../constants';
import PluginEntry from 'src/components/PluginEntry';
import { TDesign } from '@portkey/did-ui-react';
import NightElfPlugin from '../elf/NightElfPlugin';
import DiscoverPlugin from '../discover/DiscoverPlugin';
import { useWebLoginContext } from '../../context';
import { DiscoverInterface } from '../discover/useDiscover';
interface IProps {
  open: boolean;
  onClose: () => void;
  design?: TDesign;
  validWallets: string[];
}
export default function ConnectModal({ open, onClose, validWallets, design }: IProps) {
  const mobileFlag = isMobile();
  const { _api, version } = useWebLoginContext();
  const elfApi = _api.nigthElf;
  const discoverApi = _api.discover as DiscoverInterface;
  if (mobileFlag) {
    return (
      <Drawer
        className="aelf-web-conntect-drawer"
        title={
          <>
            <span className="title">Connect Wallet</span>
            <img src={CloseIcon} onClick={onClose}></img>
          </>
        }
        getContainer={false}
        closeIcon={null}
        onClose={onClose}
        prefixCls="portkey-ant-drawer"
        open={open}
        placement={'bottom'}>
        <div className="plugin-entry-wrapper">
          {validWallets.map((wallet) => {
            if (wallet === WalletType.elf) {
              return <NightElfPlugin key={wallet} onClick={elfApi.login} />;
            } else if (wallet === WalletType.discover) {
              return (
                <DiscoverPlugin
                  version={version}
                  key={wallet}
                  detectState={discoverApi.discoverDetected}
                  onClick={discoverApi.login}
                />
              );
            }
          })}
        </div>
      </Drawer>
    );
  } else {
    return (
      <Modal
        title={
          <>
            <span className="title">Connect Wallet</span>
            {design === 'Web2Design' ? (
              <img className="close-icon" src={CloseIcon} onClick={onClose}></img>
            ) : (
              <img className="left-icon" src={LeftIcon} onClick={onClose}></img>
            )}
          </>
        }
        getContainer={false}
        open={open}
        closable={false}
        footer={null}
        centered={true}
        className="aelf-web-connect-modal"
        prefixCls="portkey-ant-modal"
        width={430}>
        <div className="plugin-entry-wrapper">
          {validWallets.map((wallet) => {
            if (wallet === WalletType.elf) {
              return <NightElfPlugin key={wallet} onClick={elfApi.login} />;
            } else if (wallet === WalletType.discover) {
              return (
                <DiscoverPlugin
                  version={version}
                  key={wallet}
                  detectState={discoverApi.discoverDetected}
                  onClick={discoverApi.login}
                />
              );
            }
          })}
        </div>
      </Modal>
    );
  }
}
