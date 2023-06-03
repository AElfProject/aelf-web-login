import React from 'react';

export default function PluginEntry({ icon, name, onClick }: { icon: string; name: string; onClick: () => void }) {
  return (
    <div className="plugin-entry" onClick={onClick}>
      <div className={`icon ${icon}`}></div>
      <div className="name">{name}</div>
    </div>
  );
}
