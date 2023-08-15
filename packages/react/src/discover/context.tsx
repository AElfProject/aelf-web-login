import { Discover } from '@aelf-web-login/core';
import { createContext, useContext, useMemo } from 'react';

export type DiscoverProviderProps = {
  children: React.ReactNode;
};

type DiscoverContextType = {
  discover: Discover;
};

const DiscoverContext = createContext<DiscoverContextType>({} as DiscoverContextType);

export function useDiscover(): Discover {
  return useContext(DiscoverContext).discover;
}

export function DiscoverProvider({ children }: DiscoverProviderProps) {
  const discover = useMemo(() => new Discover(), []);
  return <DiscoverContext.Provider value={{ discover }}>{children}</DiscoverContext.Provider>;
}
