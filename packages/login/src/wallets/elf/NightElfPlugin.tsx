import { useDebounceFn } from 'ahooks';
import PluginEntry from '../../components/PluginEntry';
import isMobile from '../../utils/isMobile';
import { check } from './utils';
import { openNightElfPluginPage } from '../../utils/pluginPages';
import { ExtraWalletContext } from '../../context';
import { useContext } from 'react';

export default function NightElfPlugin({ onClick }: { onClick: () => void }) {
  const { nightElf: nightElfOpts } = useContext(ExtraWalletContext);
  const { run: onClickInternal } = useDebounceFn(
    async () => {
      const type = await check();
      if (type === 'none' && !isMobile()) {
        if (nightElfOpts?.onPluginNotFound) {
          nightElfOpts?.onPluginNotFound(openNightElfPluginPage);
        } else {
          openNightElfPluginPage();
        }
        return;
      }
      if (type === 'unknown') return;
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
    if (nightElfOpts.onClick) {
      nightElfOpts.onClick(onClickInternal);
    } else {
      onClickInternal();
    }
  };
  return <PluginEntry icon="elf" name="aelf Wallet" onClick={onClickButton} />;
}
