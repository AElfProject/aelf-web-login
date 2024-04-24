export class WalletError extends Error {
  error: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(message?: string, error?: any) {
    super(message);
    this.error = error;
  }
}

export class WalletNotReadyError extends WalletError {
  name = 'WalletNotReadyError';
}

export class WalletConnectionError extends WalletError {
  name = 'WalletConnectionError';
}
