import React from 'react';
import PluginEntry from '../components/PluginEntry';
import { WalletComponentProps } from '../types';

export default function PortkeyPlugin({ onLogin }: WalletComponentProps) {
  return <PluginEntry icon="🧝‍♂️" name="Portkey" onClick={() => {}} />;
}
