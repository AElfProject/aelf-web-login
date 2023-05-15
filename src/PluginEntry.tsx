import React from 'react';

export default function PluginEntry({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="plugin-entry">
      <div className="icon">{icon}</div>
      <div className="name">{name}</div>
    </div>
  );
}
