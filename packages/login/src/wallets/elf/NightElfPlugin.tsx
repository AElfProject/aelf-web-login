import PluginEntry from '../../components/PluginEntry';

export default function NightElfPlugin({ onClick }: { onClick: () => void }) {
  return <PluginEntry icon="elf" name="Night Elf" onClick={onClick} />;
}
