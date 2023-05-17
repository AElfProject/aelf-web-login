import React, { useCallback, useEffect, useState } from 'react';
import { useAElfReact } from '@aelf-react/core';
import { AElfContextState } from '@aelf-react/core/dist/types';
import PluginEntry from '../components/PluginEntry';
import { WalletComponentProps } from '../types';
import { AbstractWallet, ElfWallet } from '../wallet';
import { getConfig } from '../config';
import { useWebLoginContext } from '../context';

export default function NightElfPlugin() {
  const aelfReact = useAElfReact();
  const chainId = getConfig().chainId;
  const { activate } = aelfReact;
  const { setWallet } = useWebLoginContext();
  const nodes = getConfig().aelfReact.nodes;
  const [currentWallet, setCurrentWallet] = useState<ElfWallet>();

  console.log(aelfReact);

  useEffect(() => {
    if (currentWallet && aelfReact.isActive) {
      currentWallet.setInfo({
        chainId: chainId,
        aelfContext: aelfReact,
      });
      setCurrentWallet(undefined);
      setWallet(currentWallet);
    }
  }, [aelfReact.isActive, aelfReact, currentWallet, setCurrentWallet, setWallet, chainId]);

  const onClick = useCallback(async () => {
    try {
      await activate(nodes);
      console.log(aelfReact);
      const wallet = new ElfWallet();
      setCurrentWallet(wallet);
    } catch (e) {
      console.error(e);
    }
  }, [activate, aelfReact, nodes, setCurrentWallet]);

  return <PluginEntry icon="🧝‍♂️" name="Night Elf" onClick={onClick} />;
}
