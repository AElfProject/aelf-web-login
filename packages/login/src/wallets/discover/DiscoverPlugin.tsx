import React, { useContext, useMemo } from 'react';
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
  version,
  onClick,
}: {
  detectState: DiscoverDetectState;
  version?: string;
  onClick: () => void;
}) {
  const { discover: discoverOpts } = useContext(ExtraWalletContext);

  const _version = useMemo(() => (version === 'v1' ? 'v1' : undefined), [version]);
  const { run: onClickInternal } = useDebounceFn(
    async () => {
      if (isMobile() && !isPortkeyApp()) {
        openPageInDiscover(undefined, _version);
        return;
      }

      if (detectState === 'not-detected' && !isMobile()) {
        if (discoverOpts?.onPluginNotFound) {
          discoverOpts?.onPluginNotFound(openPortkeyPluginPage);
        } else {
          openPortkeyPluginPage(_version);
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
  return version === 'v1' ? (
    <PluginEntry
      name={
        <>
          Portkey
          <br />
          <span className="nowrap early-access">(Deprecated)</span>
        </>
      }
      icon={'discover'}
      onClick={onClickButton}
    />
  ) : (
    <PluginEntry name={'Portkey Wallet'} icon={'discoverV2'} onClick={onClickButton} />
  );
}
