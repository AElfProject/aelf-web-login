/* istanbul ignore file */

import { PortkeyAAWallet } from '@aelf-web-login/wallet-adapter-portkey-aa';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { TChainId, SignInDesignEnum, NetworkEnum } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyInnerWallet } from '@aelf-web-login/wallet-adapter-portkey-web';

const APP_NAME = 'forest';
const CHAIN_ID = 'tDVW' as TChainId;
const NETWORK_TYPE = NetworkEnum.TESTNET;

// const SignInProxy = () => {
//   // console.log('SignInProxy-----------');
//   // const { isLocking } = useConnectWallet();
//   // console.log('-----', isLocking);
//   return <div>111</div>;
// };

const baseConfig = {
  // ConfirmLogoutDialog: CustomizedConfirmLogoutDialog,
  // SignInComponent: SignInProxy,
  defaultPin: '111111',
  enableAcceleration: true,
  showVconsole: true,
  // omitTelegramScript: false,
  // cancelAutoLoginInTelegram: false,
  networkType: NETWORK_TYPE,
  appName: 'test-app',
  chainId: CHAIN_ID,
  sideChainId: CHAIN_ID,
  keyboard: true,
  design: SignInDesignEnum.CryptoDesign, // "SocialDesign" | "CryptoDesign" | "Web2Design"
};

const wallets = [
  // new PortkeyAAWallet({
  //   appName: APP_NAME,
  //   chainId: CHAIN_ID,
  //   autoShowUnlock: true,
  //   disconnectConfirm: true,
  //   enableAcceleration: true,
  // }),
  new PortkeyInnerWallet({ networkType: NETWORK_TYPE, chainId: CHAIN_ID, disconnectConfirm: true }),
  // new PortkeyDiscoverWallet({
  //   networkType: NETWORK_TYPE,
  //   chainId: CHAIN_ID,
  //   autoRequestAccount: true, // If set to true, please contact Portkey to add whitelist @Rachel
  //   autoLogoutOnDisconnected: true,
  //   autoLogoutOnNetworkMismatch: true,
  //   autoLogoutOnAccountMismatch: true,
  //   autoLogoutOnChainMismatch: true,
  // }),
  // new NightElfWallet({
  //   chainId: CHAIN_ID,
  //   appName: APP_NAME,
  //   connectEagerly: true,
  //   useMultiChain: false,
  //   defaultRpcUrl: RPC_SERVER_AELF,
  //   nodes: {
  //     AELF: {
  //       chainId: 'AELF',
  //       rpcUrl: RPC_SERVER_AELF,
  //     },
  //     tDVW: {
  //       chainId: 'tDVW',
  //       rpcUrl: RPC_SERVER_TDVW,
  //     },
  //     tDVV: {
  //       chainId: 'tDVV',
  //       rpcUrl: RPC_SERVER_TDVV,
  //     },
  //   },
  // }),
];

const config: IConfigProps = {
  baseConfig,
  wallets,
};

export default config;
