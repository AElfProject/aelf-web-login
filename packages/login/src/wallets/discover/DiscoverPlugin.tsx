import React from 'react';
import PluginEntry from '../../components/PluginEntry';
import { DiscoverDetectState } from './useDiscover';
import { openPortkeyPluginPage } from '../elf/utils';
import isMobile from '../../utils/isMobile';

export default function DiscoverPlugin({
  detectState,
  onClick,
}: {
  detectState: DiscoverDetectState;
  onClick: () => void;
}) {
  const onClickInternal = async () => {
    if (detectState === 'not-detected' && !isMobile()) {
      openPortkeyPluginPage();
      return;
    }
    if (detectState === 'unknown') return;
    onClick();
  };
  return <PluginEntry name="Discover" icon="discover" onClick={onClickInternal} />;
}
