import { useDebounceFn } from 'ahooks';
import PluginEntry from '../../components/PluginEntry';
import isMobile from '../../utils/isMobile';
import { check, openPluginPage } from './utils';

export default function NightElfPlugin({ onClick }: { onClick: () => void }) {
  const { run: onClickInternal } = useDebounceFn(
    async () => {
      const type = await check();
      if (type === 'none' && !isMobile()) {
        openPluginPage();
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
