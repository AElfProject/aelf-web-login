// export class WalletError extends Error {
//   error: any;

//   // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
//   constructor(message?: string, error?: any) {
//     super(message);
//     this.error = error;
//   }
// }

// export class WalletNotReadyError extends WalletError {
//   name = 'WalletNotReadyError';
// }

// export class WalletConnectionError extends WalletError {
//   name = 'WalletConnectionError';
// }

export const ERR_CODE = {
  DISCOVER_LOGIN_EAGERLY_FAIL: 10001,
  NETWORK_TYPE_NOT_MATCH: 10002,
  ACCOUNTS_IS_EMPTY: 10003,
  USER_CANCEL: 10004,
  UNKNOWN: 10005,
};

export const ERR_CODE_MSG: {
  [key: number]: string;
} = {
  10001: 'Discover login eagerly fail',
  10002:
    'Unmatched network. Please switch the network through "My" > "Wallet" > "Switch Networks" to continue.',
  10003: 'Synchronising data on the blockchain. Please wait a few seconds.',
  10004: 'User cancel',
  10005: 'Unknown error',
};

export function makeError(code: number) {
  return {
    name: 'WalletError',
    code,
    message: ERR_CODE_MSG[code],
  };
}
