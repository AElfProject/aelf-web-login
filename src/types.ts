export interface WalletInterface {
  initialize(): Promise<void>;
}

export type WebLoginCallback = (error?: Error, wallet?: WalletInterface) => void;
export type WebLoginContextType = {
  setModalOpen: (open: boolean) => void;
  checkWebLogin: () => Promise<WalletInterface | undefined>;
  openWebLogin: (callback: WebLoginCallback) => void;
};

export type WebLoginHook = () => {
  login: () => Promise<WalletInterface | undefined>;
  logout: () => Promise<boolean>;
  checkWebLogin: () => Promise<WalletInterface | undefined>;
  openWebLogin: () => Promise<WalletInterface>;
};

export type WalletComponentProps = {
  onLogin: WebLoginCallback;
};
