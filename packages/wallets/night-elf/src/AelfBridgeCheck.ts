import AElfBridge from 'aelf-bridge';

let aelfBridgeInstance: AelfBridgeCheck;
let aelfInstanceByBridge: any;
let accountInfo: any = null;

export default class AelfBridgeCheck {
  public check: () => Promise<boolean>;
  constructor() {
    this.check = async () => {
      return new Promise((resolve, reject) => {
        let timeout = false;
        const bridgeInstance = new AElfBridge({
          timeout: 3000,
        });
        console.log('bridgeInstance', bridgeInstance);
        bridgeInstance
          .connect()
          .then((isConnected: boolean) => {
            console.log('bridgeInstance isConnected', isConnected);
            if (timeout) return;
            if (isConnected) {
              resolve(true);
            } else {
              reject({
                error: 200001,
                message: 'timeout, please use AELF Wallet APP or open the page in PC',
              });
            }
          })
          .catch((e: any) => {
            console.log('error in catch:', e);
          });
        setTimeout(() => {
          timeout = true;
          reject({
            error: 200001,
            message: 'timeout, please use AELF Wallet APP or open the page in PC',
          });
        }, 3000);
      });
    };
  }
  static getInstance() {
    if (aelfBridgeInstance) return aelfBridgeInstance;
    aelfBridgeInstance = new AelfBridgeCheck();
    return aelfBridgeInstance;
  }

  static initAelfInstanceByExtension(rpcUrl: string, appName: string) {
    aelfInstanceByBridge = new AElfBridge({
      endpoint: rpcUrl,
    });

    aelfInstanceByBridge.login = async () => {
      if (accountInfo) {
        return accountInfo;
      }
      const account = await aelfInstanceByBridge.account();
      accountInfo = {
        detail: JSON.stringify(account.accounts[0]),
      };
      return accountInfo;
    };
    aelfInstanceByBridge.logout = (_: any, callback: () => void) => {
      accountInfo = null;
      callback?.();
    };
    return aelfInstanceByBridge;
  }
}
