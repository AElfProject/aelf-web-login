export interface CallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
}

export interface WalletInterface {
  error: unknown;
  logout(): Promise<void>;
  callContract<T, R>(params: CallContractParams<T>): Promise<R>;
}

export type WebLoginInterface = {
  login: () => Promise<WalletInterface | undefined>;
  logout: () => Promise<void>;
  checkWebLogin: () => Promise<WalletInterface | undefined>;
  openWebLogin: () => Promise<WalletInterface>;
};

export type WebLoginCallback = (error?: any | unknown, wallet?: WalletInterface) => void;

export type WebLoginContextType = WebLoginInterface & {
  wallet?: WalletInterface;
  setWallet: (wallet?: WalletInterface) => void;
  setModalOpen: (open: boolean) => void;
};
export type WebLoginHook = () => WebLoginInterface;

export type WalletComponentProps = {
  // onLogin: WebLoginCallback;
};
