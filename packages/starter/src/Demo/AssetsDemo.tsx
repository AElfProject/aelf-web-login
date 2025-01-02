import { useCallback, useEffect, useMemo } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';

export interface ExtraInfoForPortkeyAA {
  publicKey: string;
  portkeyInfo: PortkeyDid.DIDWalletInfo & {
    accounts: TAelfAccounts;
    nickName: string;
  };
}

export type TAelfAccounts = {
  AELF?: string;
  tDVV?: string;
  tDVW?: string;
};

const AccountDemo: React.FC = () => {
  const { walletType, walletInfo } = useConnectWallet();
  const portkeyAAInfo = useMemo(() => {
    return walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
  }, [walletInfo?.extraInfo]);

  const handleDeleteAccount = useCallback(() => {
    localStorage.clear();
  }, []);

  return (
    <div className={'my-asset-wrapper'}>
      {(walletType !== WalletTypeEnum.aa || !portkeyAAInfo?.portkeyInfo) &&
        'Please login with portkey sdk'}
      {portkeyAAInfo?.portkeyInfo?.pin && walletType === WalletTypeEnum.aa && (
        <PortkeyDid.PortkeyAssetProvider
          originChainId={portkeyAAInfo?.portkeyInfo?.chainId}
          pin={portkeyAAInfo?.portkeyInfo?.pin}
        >
          <PortkeyDid.Asset
            isShowRamp={false}
            isShowRampBuy={false}
            isShowRampSell={false}
            backIcon={<LeftOutlined />}
            // onOverviewBack={onOverviewBack}
            onLifeCycleChange={(lifeCycle) => {
              console.log(lifeCycle, 'onLifeCycleChange');
            }}
            onDeleteAccount={handleDeleteAccount}
          />
        </PortkeyDid.PortkeyAssetProvider>
      )}
    </div>
  );
};

export default AccountDemo;
