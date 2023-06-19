import React from 'react';
import PluginEntry from '../../components/PluginEntry';
import { DiscoverDetectState } from './useDiscover';
import { openPortkeyPluginPage } from '../elf/utils';
import isMobile from '../../utils/isMobile';
import { useDebounceFn } from 'ahooks';

export default function DiscoverPlugin({
  detectState,
  onClick,
}: {
  detectState: DiscoverDetectState;
  onClick: () => void;
}) {
  const { run: onClickInternal } = useDebounceFn(
    async () => {
      if (detectState === 'not-detected' && !isMobile()) {
        openPortkeyPluginPage();
        return;
      }
      if (detectState === 'unknown') return;
      onClick();
    },
    {
      wait: 500,
      maxWait: 500,
      leading: true,
    },
  );
  return <PluginEntry name="Discover" icon="discover" onClick={onClickInternal} />;
}
