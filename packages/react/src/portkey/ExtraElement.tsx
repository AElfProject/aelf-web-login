import { Button } from 'antd';
import { PortkeyStyleProvider } from '@portkey/did-ui-react';
import { PortkeySDKProviderProps, usePortkeyState } from './context';
import IconPortkey from '../icons/IconPortkey';
import IconNightElf from '../icons/IconNightElf';
import { useExtraWalletLogin } from '../hooks/useExtraWalletLogin';
import { useDiscover } from '../discover/context';
import { useNightElf } from '../nightElf/context';

export default function ExtraElement(props: PortkeySDKProviderProps) {
  const portkeyState = usePortkeyState();
  const design = portkeyState.design;
  const showDiscover = props.showDiscover !== false;
  const showNightElf = props.showNightElf !== false;

  const discoverLogin = useExtraWalletLogin(useDiscover());
  const nightElfLogin = useExtraWalletLogin(useNightElf());

  if (!showDiscover && !showDiscover) return <></>;

  const renderButtons = ({ iconType }: { iconType: 'circle' | 'plain' }) => {
    return (
      <>
        {showDiscover && (
          <Button className="aelf-web-login-btn" icon={<IconPortkey type={iconType} />} onClick={discoverLogin}>
            Portkey
          </Button>
        )}
        {showNightElf && (
          <Button className="aelf-web-login-btn" icon={<IconNightElf type={iconType} />} onClick={nightElfLogin}>
            Night Elf
          </Button>
        )}
      </>
    );
  };

  if (design === 'SocialDesign') {
    const socialDesign = props.socialDesign || {};
    return (
      <PortkeyStyleProvider>
        <div className="aelf-web-login-extra social-design">
          <div className="logo">{socialDesign.logo && <img src={socialDesign.logo} />}</div>
          <div className="title">{socialDesign.title || 'Select Login Method'}</div>
          <div className="buttons">{renderButtons({ iconType: 'plain' })}</div>
        </div>
      </PortkeyStyleProvider>
    );
  }

  if (design === 'Web2Design') {
    return (
      <PortkeyStyleProvider>
        <div className="aelf-web-login-extra web2-design">
          <div className="title">Crypto wallet</div>
          <div className="buttons">{renderButtons({ iconType: 'circle' })}</div>
        </div>
      </PortkeyStyleProvider>
    );
  }

  return (
    <PortkeyStyleProvider>
      <div className="aelf-web-login-extra crypto-design">
        <div className="title">Crypto wallet</div>
        <div className="buttons">
          {showDiscover && (
            <div className="button" onClick={discoverLogin}>
              <IconPortkey type="circle" />
              <span>Portkey</span>
            </div>
          )}
          {showNightElf && (
            <div className="button" onClick={nightElfLogin}>
              <IconNightElf type="circle" />
              <span>Night Elf</span>
            </div>
          )}
        </div>
      </div>
    </PortkeyStyleProvider>
  );
}
