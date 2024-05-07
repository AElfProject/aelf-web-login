import { ReactNode, useContext } from 'react';
import { ExtraWalletContext } from '../context';

export default function PluginEntry({ icon, name, onClick }: { icon: string; name: ReactNode; onClick: () => void }) {
  const { portkey: portkeyOpts } = useContext(ExtraWalletContext);
  return (
    <div className={`plugin-entry plugin-entry-${portkeyOpts.design}`} onClick={onClick}>
      <div className={`icon ${icon}`}></div>
      <div className="name">{name}</div>
    </div>
  );
}
