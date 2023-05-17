import React from 'react';
import { useAElfReact } from '@aelf-react/core';
import PluginEntry from '../components/PluginEntry';
import { WalletComponentProps } from '../types';
import { ElfWallet } from '../wallet';
import { getConfig } from '../config';

export default function NightElfPlugin({ onLogin }: WalletComponentProps) {
  const { activate, deactivate, connectEagerly } = useAElfReact();
  const nodes = getConfig().aelfReact.nodes;

  console.log(useAElfReact());

  const onClick = async () => {
    try {
      const res = await activate(nodes);
      const chain = (res as any).rpcUrl.chain;
      onLogin(undefined, new ElfWallet(res, chain));
    } catch (e) {
      onLogin(e, undefined);
    }
  };

  return <PluginEntry icon="🧝‍♂️" name="Night Elf" onClick={onClick} />;
}
