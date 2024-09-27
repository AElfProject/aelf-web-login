import { TWalletError } from './types';

export const ERR_CODE = {
  DISCOVER_LOGIN_EAGERLY_FAIL: 10001,
  NETWORK_TYPE_NOT_MATCH: 10002,
  ACCOUNTS_IS_EMPTY: 10003,
  USER_CANCEL: 10004,
  WITHOUT_DETECT_PROVIDER: 10005,
  NOT_PORTKEY: 10006,
  DISCOVER_NOT_CONNECTED: 10007,
  DISCOVER_LOGIN_FAIL: 10008,
  PORTKEY_AA_NOT_CONNECTED: 10009,
  PORTKEY_AA_LOGIN_FAIL: 10010,
  PORTKEY_AA_LOGOUT_FAIL: 10011,
  PORTKEY_AA_UNLOCK_FAIL: 10012,
  INIT_BRIDGE_ERROR: 10013,
  WITHOUT_AELF_NODES: 10014,
  NIGHT_ELF_LOGIN_FAIL: 10015,
  NIGHT_ELF_LOGIN_EAGERLY_FAIL: 10016,
  NIGHT_ELF_LOGOUT_FAIL: 10017,
  NIGHT_ELF_NOT_CONNECTED: 10018,
  INVALID_CONTRACT_ADDRESS: 10019,
  ONFINISH_IS_ERROR: 10020,
  CANT_CALL_SEND_METHOD: 10021,
  GET_LOGIN_STATUS_FAIL: 10022,
  IN_FINISH_BUT_STATUS_IS_NOT_SUCCESS: 10023,
  UNKNOWN: 10024,
};

export const ERR_CODE_MSG: {
  [key: number]: string;
} = {
  10001: 'Automatic login failed. Please log in manually.',
  10002:
    'Unmatched network. Please switch the network through "My" > "Wallet" > "Switch Networks" to continue.',
  10003: 'Synchronising data on the blockchain. Please wait a few seconds.',
  10004: 'User cancel',
  10005: 'Discover provider not found',
  10006: 'Discover provider found, but check isPortkey failed',
  10007: 'Discover is not connected',
  10008: 'There is something wrong at login stage with discover',

  10009: 'portkeyAA wallet is not connected, or is locked',
  10010: 'There is something wrong at login stage with portkeyAA',
  10011: 'There is something wrong at logout stage with portkeyAA',
  10012: 'There is something wrong at unlock stage with portkeyAA',

  10013: 'Init bridge error',
  10014: 'The aelf nodes is empty',
  10015: 'There is something wrong at login stage with nightElf',
  10016: 'There is something wrong at loginEagerly stage with nightElf',
  10017: 'There is something wrong at logout stage with nightElf',
  10018: 'NightElf is not connected',
  10019: 'The contract address is invalid',
  10020: 'The method onCreatePending execute successful, but onFinish execute fail',
  10021: 'Without log in, send methods cannot be called',
  10022: 'Call getLoginStatus but the result is not pass',
  10023: 'Login completed, but the isLoginStatus is not success. Please log in again',
  10024: 'Unknown error',
};

export function makeError(code: number, nativeError?: any): TWalletError {
  return {
    name: 'WalletError',
    code,
    message: ERR_CODE_MSG[code],
    nativeError,
  };
}
