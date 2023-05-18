import React from 'react';
import PluginEntry from '../../components/PluginEntry';

export default function PortkeyPlugin() {
  return (
    <PluginEntry
      icon="🧝‍♂️"
      name="Portkey"
      onClick={() => {
        console.log('unsupported');
      }}
    />
  );
}
