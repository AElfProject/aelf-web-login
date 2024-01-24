import { useCallback, useContext, useMemo, useState } from 'react';
import {
  CloseIcon,
  DiscoverIcon,
  DiscoverSquareIcon,
  ElfIcon,
  ElfSquareIcon,
  RightIcon,
  WEB_LOGIN_VERSION,
  WalletType,
} from '../../constants';
import { WalletHookInterface } from '../../types';
import isMobile from '../../utils/isMobile';
import isPortkeyApp, { changePortkeyVersion } from '../../utils/isPortkeyApp';
import DiscoverPlugin from '../discover/DiscoverPlugin';
import { DiscoverInterface } from '../discover/useDiscover';
import NightElfPlugin from '../elf/NightElfPlugin';
import { PortkeyInterface } from '../portkey/usePortkey';
import { Button } from 'antd';
import ConnectModal from './ConnectModal';
import { ExtraWalletContext, useWebLogin } from '../../context';

interface IProps {
  headerClassName: string;
  contentClassName: string;
  portkeyApi: PortkeyInterface;
  elfApi: WalletHookInterface;
  discoverApi: DiscoverInterface;
  isBridgeNotExist: boolean;
}
export default function ExtraWallets({
  headerClassName,
  contentClassName,
  portkeyApi,
  elfApi,
  discoverApi,
  isBridgeNotExist,
}: IProps) {
  const isMobileDevice = isMobile();
  const { commonConfig, portkey: portkeyOpts, extraWallets } = useContext(ExtraWalletContext);
  const { version } = useWebLogin();
  const isDiscoverMobileNotExist =
    discoverApi.discoverDetected === 'unknown' || (discoverApi.discoverDetected === 'not-detected' && isMobileDevice);
  const isShowDiscoverButton = isMobile() && !isPortkeyApp();
  const [connectModal, setcCnnectModal] = useState(false);
  const openConnectModal = useCallback(() => {
    setcCnnectModal(true);
  }, [setcCnnectModal]);
  const closeConnectModal = useCallback(() => {
    setcCnnectModal(false);
  }, [setcCnnectModal]);

  const onChangeVersion = () => {
    changePortkeyVersion(version);
  };

  const validWallets = useMemo(() => {
    return extraWallets?.filter((wallet) => {
      if (wallet === WalletType.elf) {
        return !isBridgeNotExist;
      } else if (wallet === WalletType.discover) {
        return !isDiscoverMobileNotExist || isShowDiscoverButton;
      }
      return true;
    });
  }, [extraWallets, isBridgeNotExist, isDiscoverMobileNotExist, isShowDiscoverButton]);

  const SocialDesignWallet = (
    <>
      <div className={headerClassName}>
        <div>
          {commonConfig?.showClose && (
            <div className="header">
              <button className="header-btn" onClick={portkeyApi.onCancel}>
                <img src={CloseIcon}></img>
              </button>
            </div>
          )}
          {commonConfig?.iconSrc && (
            <div className="title-icon">
              <img src={commonConfig?.iconSrc}></img>
            </div>
          )}
        </div>
        <div className="title">Crypto wallet</div>
      </div>
      <div className={`wallet-entries ${contentClassName}`}>
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
    </>
  );
  const CryptoDesignnWallet = (
    <>
      <div className={headerClassName}>
        <div className="title">Crypto wallet</div>
      </div>
      <div className={`wallet-entries ${contentClassName}`}>
        <Button type="primary" onClick={openConnectModal}>
          <span className="title">Connect wallet</span>
          <span className="icon">
            {validWallets.map((wallet) => {
              if (wallet === WalletType.elf) {
                return <img src={ElfIcon} key="elf" className="elf"></img>;
              } else if (wallet === WalletType.discover) {
                return <img src={DiscoverIcon} key="discover" className="discover"></img>;
              }
            })}
            <img src={RightIcon} className="left"></img>
          </span>
        </Button>
      </div>
    </>
  );
  const Web2DesignWallet = (
    <>
      <div className={headerClassName}>
        <div className="title">Crypto wallet</div>
      </div>
      <div className={`wallet-entries ${contentClassName}`}>
        <Button type="primary" onClick={openConnectModal}>
          <span className="title">Connect wallet</span>
          <span className="icon">
            {validWallets.map((wallet) => {
              if (wallet === WalletType.elf) {
                return <img src={ElfSquareIcon} key="elf" className="elf"></img>;
              } else if (wallet === WalletType.discover) {
                return <img src={DiscoverSquareIcon} key="discover" className="discover"></img>;
              }
            })}
            <img src={RightIcon} className="left"></img>
          </span>
        </Button>
      </div>
    </>
  );

  const extraWalletMap = {
    SocialDesign: SocialDesignWallet,
    CryptoDesign: CryptoDesignnWallet,
    Web2Design: Web2DesignWallet,
  };
  return (
    <>
      <div className="aelf-web-login aelf-extra-wallets">{extraWalletMap[portkeyOpts.design || 'SocialDesign']}</div>
      <ConnectModal
        open={connectModal}
        onClose={closeConnectModal}
        design={portkeyOpts.design}
        validWallets={validWallets}></ConnectModal>
    </>
  );
}
