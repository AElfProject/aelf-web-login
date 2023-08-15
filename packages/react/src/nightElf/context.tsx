import { NightElf } from '@aelf-web-login/core';
import { createContext, useContext, useMemo } from 'react';

export type NightElfProviderProps = {
  children: React.ReactNode;
};

type NightElfContextType = {
  nightElf: NightElf;
};

const NightElfContext = createContext<NightElfContextType>({} as NightElfContextType);

export function useNightElf(): NightElf {
  return useContext(NightElfContext).nightElf;
}

export function NightElfProvider({ children }: NightElfProviderProps) {
  const nightElf = useMemo(() => new NightElf(), []);
  return <NightElfContext.Provider value={{ nightElf }}>{children}</NightElfContext.Provider>;
}
