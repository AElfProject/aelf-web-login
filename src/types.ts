export interface WalletInterface {}

export type WebLoginCallback = (error?: Error, wallet?: WalletInterface) => void;
export type WebLoginContextType = {
  setModalOpen: (open: boolean) => void;
  openWebLogin: (callback: WebLoginCallback) => void;
};

export type WebLoginHook = () => () => Promise<WalletInterface>;

export type WalletComponentProps = {
  onLogin: WebLoginCallback;
};
