import { TWalletError } from './types';

export const ERR_CODE = {
  DISCOVER_LOGIN_EAGERLY_FAIL: 10001,
  NETWORK_TYPE_NOT_MATCH: 10002,
  ACCOUNTS_IS_EMPTY: 10003,
  USER_CANCEL: 10004,
  WITHOUT_DETECT_PROVIDER: 10005,
  NOT_PORTKEY: 10006,
  DISCOVER_NOT_CONNECTED: 10007,
  UNKNOWN: 10008,
};

export const ERR_CODE_MSG: {
  [key: number]: string;
} = {
  10001: 'Discover login eagerly fail',
  10002:
    'Unmatched network. Please switch the network through "My" > "Wallet" > "Switch Networks" to continue.',
  10003: 'Synchronising data on the blockchain. Please wait a few seconds.',
  10004: 'User cancel',
  10005: 'Discover provider not found',
  10006: 'Discover provider found, but check isPortkey failed',
  10007: 'Discover not connected',
  10008: 'Unknown error',
};

export function makeError(code: number, nativeError?: any): TWalletError {
  return {
    name: 'WalletError',
    code,
    message: ERR_CODE_MSG[code],
    nativeError,
  };
}
