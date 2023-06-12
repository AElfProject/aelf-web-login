import React from 'react';
import PluginEntry from '../../components/PluginEntry';

export default function DiscoverPlugin({ onClick }: { onClick: () => void }) {
  return <PluginEntry name="Discover" icon="discover" onClick={onClick} />;
}
