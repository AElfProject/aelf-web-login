import React from 'react';
import PluginEntry from '../../components/PluginEntry';
import { DiscoverDetectState } from './useDiscover';
import isMobile from '../../utils/isMobile';
import { useDebounceFn } from 'ahooks';
import { DiscoverOptions } from '../../types';
import { openPortkeyPluginPage } from '../../utils/pluginPages';
import isPortkeyApp from '../../utils/isPortkeyApp';
import openPageInDiscover from './openDiscoverPage';

export default function DiscoverPlugin({
  detectState,
  discoverOpts,
  onClick,
}: {
  detectState: DiscoverDetectState;
  discoverOpts: DiscoverOptions;
  onClick: () => void;
}) {
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
  return <PluginEntry name="Portkey" icon="discover" onClick={onClickInternal} />;
}
