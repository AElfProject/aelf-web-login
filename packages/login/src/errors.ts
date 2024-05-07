export const ERR_CODE = {
  DISCOVER_LOGIN_EAGERLY_FAIL: 10001,
  NETWORK_TYPE_NOT_MATCH: 10002,
  ACCOUNTS_IS_EMPTY: 10003,
  USER_CANCEL: 10004,
};

export const ERR_CODE_MSG: {
  [key: number]: string;
} = {
  10001: 'Discover login eagerly fail',
  10002: 'Unmatched network. Please switch the network through "My" > "Wallet" > "Switch Networks" to continue.',
  10003: 'Synchronising data on the blockchain. Please wait a few seconds.',
  10004: 'User cancel',
};

export function makeError(code: number) {
  return {
    code,
    message: ERR_CODE_MSG[code],
  };
}
