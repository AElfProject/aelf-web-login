import { useDebounceFn } from 'ahooks';
import PluginEntry from '../../components/PluginEntry';
import isMobile from '../../utils/isMobile';
import { check } from './utils';
import { NightElfOptions } from '../../types';
import { openNightElfPluginPage } from '../../utils/pluginPages';

export default function NightElfPlugin({
  nightEflOpts,
  onClick,
}: {
  nightEflOpts: NightElfOptions;
  onClick: () => void;
}) {
  const { run: onClickInternal } = useDebounceFn(
    async () => {
      const type = await check();
      if (type === 'none' && !isMobile()) {
        if (nightEflOpts?.onPluginNotFound) {
          nightEflOpts?.onPluginNotFound(openNightElfPluginPage);
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
  return <PluginEntry icon="elf" name="Night Elf" onClick={onClickInternal} />;
}
