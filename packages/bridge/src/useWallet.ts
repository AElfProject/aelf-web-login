import { createContext, useContext } from 'react';

export interface WalletContextState {
  login(): Promise<void>;
}

const DEFAULT_CONTEXT: Partial<WalletContextState> = {
  login() {
    return Promise.reject(logMissingProviderError('call', 'connect'));
  },
};

function logMissingProviderError(action: string, property: string) {
  const error = new Error(
    `You have tried to ${action} "${property}" on a WalletContext without providing one. ` +
      'Make sure to render a WalletProvider as an ancestor of the component that uses WalletContext.',
  );
  console.error(error);
  return error;
}

export const WalletContext: React.Context<WalletContextState> = createContext<WalletContextState>(
  DEFAULT_CONTEXT as WalletContextState,
);

export function useWallet(): WalletContextState {
  return useContext(WalletContext);
}
