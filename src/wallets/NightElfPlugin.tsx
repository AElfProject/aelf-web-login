import React from 'react';
import { useAElfReact } from '@aelf-react/core';
import PluginEntry from '../PluginEntry';

export default function NightElfPlugin() {
  const { activate, deactivate, connectEagerly } = useAElfReact();

  return <PluginEntry icon="🧝‍♂️" name="Night Elf" />;
}
