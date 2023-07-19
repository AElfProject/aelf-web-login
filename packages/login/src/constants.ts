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

export const CloseIcon =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9Ikljb24gLyBMaW5lIC8gTGVmdCI+CjxwYXRoIGlkPSJTaGFwZSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04LjAwMDAyIDUuNDU0OTlMMTIuOTI4NSAwLjUyNzAwMkMxMy4zODMgMC4wNzI0NjM4IDE0LjA0NTUgLTAuMTA1MDU0IDE0LjY2NjQgMC4wNjEzMTg5QzE1LjI4NzMgMC4yMjc2OTIgMTUuNzcyMyAwLjcxMjY3OCAxNS45Mzg3IDEuMzMzNTlDMTYuMTA1MSAxLjk1NDUgMTUuOTI3NiAyLjYxNyAxNS40NzMgMy4wNzE1NEwxMC41NDQgNy45OTg5OUwxNS40NzMgMTIuOTI4NUMxNi4xMzY2IDEzLjU5MjEgMTYuMTczNSAxNC42NDUxIDE1LjU4MzYgMTUuMzUyTDE1LjQ3MyAxNS40NzNDMTQuNzcwNCAxNi4xNzU3IDEzLjYzMTEgMTYuMTc1NyAxMi45Mjg1IDE1LjQ3M0w4LjAwMDAyIDEwLjU0NUwzLjA3MTU3IDE1LjQ3M0MyLjQwNzk1IDE2LjEzNjYgMS4zNTQ5MiAxNi4xNzM1IDAuNjQ4MDMzIDE1LjU4MzZMMC41MjcwMzEgMTUuNDczQy0wLjE3NTYyMyAxNC43NzAzIC0wLjE3NTYyMyAxMy42MzExIDAuNTI3MDMxIDEyLjkyODVMNS40NTUwMiA3Ljk5OTk5TDAuNTI3MDMxIDMuMDcxNTRDMC4xMTAzNzIgMi42NTQ4OCAtMC4wNzM1MTMxIDIuMDYzNDcgMC4wMjY4ODE4IDEuNDg5NTRMMC4wNjEzNDkyIDEuMzMzNTlDMC4yMjc3MjEgMC43MTI2NzggMC43MTI3MDcgMC4yMjc2OTIgMS4zMzM2MiAwLjA2MTMxODlDMS45NTQ1MyAtMC4xMDUwNTQgMi42MTcwMyAwLjA3MjQ2MzggMy4wNzE1NyAwLjUyNzAwMkw4LjAwMDAyIDUuNDU0OTlaIiBmaWxsPSIjNTE1QTYyIi8+CjwvZz4KPC9zdmc+Cg==';
