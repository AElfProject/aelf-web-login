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
  loginError?: any | unknown;
  loginState: WebLoginState;
  loginEagerly: () => void;
  login: () => void;
  logout: () => void;
};

export enum WebLoginState {
  initial = 'initial',
  lock = 'lock',
  eagerly = 'eagerly',
  logining = 'logining',
  login = 'login',
}

export type WebLoginContextType = WebLoginInterface & {
  wallet?: WalletInterface;
  setLoginError: (error: any | unknown) => void;
  setLoginState: (state: WebLoginState) => void;
  setWallet: (wallet?: WalletInterface) => void;
  setModalOpen: (open: boolean) => void;
};

export type ExtraWalletNames = 'portkey' | 'elf';

export type WebLoginProviderProps = {
  connectEagerly: boolean;
  autoShowUnlock: boolean;
  extraWallets: Array<ExtraWalletNames>;
  children: React.ReactNode;
};

export type WebLoginHook = () => WebLoginInterface;

export type WalletComponentProps = {
  // onLogin: WebLoginCallback;
};
