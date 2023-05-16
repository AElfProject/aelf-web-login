export interface CallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
}

export interface WalletInterface {
  initialize(): Promise<void>;
  logout(): Promise<void>;
  callContract<T, R>(params: CallContractParams<T>): Promise<R>;
}

export type WebLoginCallback = (error?: Error, wallet?: WalletInterface) => void;
export type WebLoginContextType = {
  wallet?: WalletInterface;
  setWallet: (wallet?: WalletInterface) => void;
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
