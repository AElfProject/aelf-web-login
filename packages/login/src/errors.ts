export const ERR_CODE = {
  DISCOVER_LOGIN_EAGERLY_FAIL: 10001,
  NETWORK_TYPE_NOT_MATCH: 10002,
};

export const ERR_CODE_MSG: {
  [key: number]: string;
} = {
  10001: 'Discover login eagerly fail',
  10002: 'Network type not match',
};

export function makeError(code: number) {
  return {
    code,
    message: ERR_CODE_MSG[code],
  };
}
