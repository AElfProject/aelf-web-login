import React from 'react';
import { useAElfReact } from '@aelf-react/core';
import PluginEntry from '../components/PluginEntry';
import { WalletComponentProps } from '../types';
import { BridgedWallet } from '../wallet';

export default function NightElfPlugin({ onLogin }: WalletComponentProps) {
  const { activate, deactivate, connectEagerly } = useAElfReact();

  const onClick = async () => {
    try {
      const res = await activate();
      onLogin(undefined, new BridgedWallet(res));
    } catch (e) {
      onLogin(e, undefined);
    }
  };

  return <PluginEntry icon="🧝‍♂️" name="Night Elf" onClick={onClick} />;
}
