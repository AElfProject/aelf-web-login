export const ERR_CODE = {
  LOGIN_EAGERLY_FAIL: 10001,
  NETWORK_TYPE_NOT_MATCH: 10002,
  ACCOUNTS_IS_EMPTY: 10003,
  USER_CANCEL: 10004,
  PORTKEY_SDK_COMMON_ERROR: 10005,
};

export const ERR_CODE_MSG: {
  [key: number]: string;
} = {
  10001: 'Login eagerly fail',
  10002: 'Network type not match',
  10003: 'Accounts is empty',
  10004: 'User cancel',
};

export function makeError(code: number) {
  return {
    code,
    message: ERR_CODE_MSG[code],
  };
}
