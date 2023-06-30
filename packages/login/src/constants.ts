export enum WalletType {
  unknown = 'unknown',
  discover = 'discover',
  elf = 'elf',
  portkey = 'portkey',
}

export enum WebLoginState {
  initial = 'initial',
  lock = 'lock',
  eagerly = 'eagerly',
  logining = 'logining',
  logined = 'logined',
  logouting = 'logouting',
}

export enum WebLoginEvents {
  ERROR = 'commonError',
  LOGIN_ERROR = 'loginError',
  LOGINED = 'logined',
  LOGOUT = 'logout',
  LOCK = 'lock',
  USER_CANCEL = 'userCancel',
  MODAL_CANCEL = 'modalCancel',
  BRIDGE_CANCEL = 'bridgeCancel',
  DISCOVER_DISCONNECTED = 'discoverDisconnected',
  NETWORK_MISMATCH = 'networkMismatch',
  ACCOUNTS_MISMATCH = 'accountsMismatch',
  CHAINID_MISMATCH = 'chainIdMismatch',
}
