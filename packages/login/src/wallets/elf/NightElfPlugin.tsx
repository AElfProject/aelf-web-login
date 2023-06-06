import PluginEntry from '../../components/PluginEntry';
import isMobile from '../../utils/isMobile';
import { check, openPluginPage } from './utils';

export default function NightElfPlugin({ onClick }: { onClick: () => void }) {
  const onClickInternal = async () => {
    const type = await check();
    if (type === 'none' && !isMobile()) {
      openPluginPage();
      return;
    }
    if (type === 'unknown') return;
    onClick();
  };

  return <PluginEntry icon="elf" name="Night Elf" onClick={onClickInternal} />;
}
