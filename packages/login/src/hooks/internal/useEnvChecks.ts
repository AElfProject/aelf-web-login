import { useState } from 'react';
import isMobile from 'src/utils/isMobile';
import isPortkeyApp from 'src/utils/isPortkeyApp';
import NightElfCheck from 'src/wallets/elf/NightElfCheck';

export type EnvType = 'unknown' | 'detected' | 'no-detected';
export type EnvChecks = {
  nightElf: EnvType;
  aelfBridge: EnvType;
  portkey: EnvType;
  discover: EnvType;
};

function check(onChange: (envChecks: EnvChecks) => void) {
  const envChecks: EnvChecks = {
    nightElf: 'unknown',
    aelfBridge: 'unknown',
    portkey: 'unknown',
    discover: 'unknown',
  };

  if (isPortkeyApp()) {
    envChecks.nightElf = 'no-detected';
    envChecks.aelfBridge = 'no-detected';
    envChecks.portkey = 'no-detected';
    envChecks.discover = 'detected';
    onChange(envChecks);
    return;
  }

  const win = window as any;
  if (win.NightElf) {
    envChecks.nightElf = 'no-detected';
    envChecks.aelfBridge = 'no-detected';
    envChecks.portkey = 'no-detected';
    envChecks.discover = 'detected';
    onChange(envChecks);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default function useEnvChecks() {}
