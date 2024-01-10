import React, { useContext } from 'react';
import PluginEntry from '../../components/PluginEntry';
import { DiscoverDetectState } from './useDiscover';
import isMobile from '../../utils/isMobile';
import { useDebounceFn } from 'ahooks';
import { openPortkeyPluginPage } from '../../utils/pluginPages';
import isPortkeyApp from '../../utils/isPortkeyApp';
import openPageInDiscover from './openDiscoverPage';
import { ExtraWalletContext } from '../../context';

export default function DiscoverPlugin({
  detectState,
  onClick,
}: {
  detectState: DiscoverDetectState;
  onClick: () => void;
}) {
  const { discover: discoverOpts } = useContext(ExtraWalletContext);
  const { run: onClickInternal } = useDebounceFn(
    async () => {
      if (isMobile() && !isPortkeyApp()) {
        openPageInDiscover();
        return;
      }

      if (detectState === 'not-detected' && !isMobile()) {
        if (discoverOpts?.onPluginNotFound) {
          discoverOpts?.onPluginNotFound(openPortkeyPluginPage);
        } else {
          openPortkeyPluginPage();
        }
        return;
      }
      if (detectState === 'unknown') return;
      onClick();
    },
    {
      wait: 500,
      maxWait: 500,
      leading: true,
      trailing: false,
    },
  );

  const onClickButton = () => {
    if (discoverOpts.onClick) {
      discoverOpts.onClick(onClickInternal);
    } else {
      onClickInternal();
    }
  };
  return <PluginEntry name="Portkey" icon="discover" onClick={onClickButton} />;
}
