import { Drawer, Modal } from 'antd';
import isMobile from '../../utils/isMobile';
import { CloseIcon, WalletType } from '../../constants';
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
export default function ConnectModal({ open, onClose, validWallets }: IProps) {
  const mobileFlag = isMobile();
  const { _api } = useWebLoginContext();
  const elfApi = _api.nigthElf;
  const discoverApi = _api.discover as DiscoverInterface;
  if (mobileFlag) {
    return (
      <Drawer
        className="crypto-conntect-modal"
        title={
          <>
            <span className="title">Connect Wallet</span>
            <img src={CloseIcon} onClick={onClose}></img>
          </>
        }
        closeIcon={null}
        onClose={onClose}
        open={open}
        placement={'bottom'}>
        <div className="plugin-entry-wrapper">
          {validWallets.map((wallet) => {
            if (wallet === WalletType.elf) {
              return <NightElfPlugin key={wallet} onClick={elfApi.login} />;
            } else if (wallet === WalletType.discover) {
              return (
                <DiscoverPlugin key={wallet} detectState={discoverApi.discoverDetected} onClick={discoverApi.login} />
              );
            }
          })}
        </div>
      </Drawer>
    );
  } else {
    return (
      <Modal title="Basic Modal" open={open} closable={true} footer={null}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    );
  }
}
