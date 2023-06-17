import AElfBridge from 'aelf-bridge';

let aelfBridgeInstance: AelfBridgeCheck | undefined = undefined;

export default class AelfBridgeCheck {
  public check?: () => Promise<boolean>;
  constructor() {
    this.check = async () => {
      return new Promise((resolve, reject) => {
        let timeout = false;
        const bridgeInstance = new AElfBridge({
          timeout: 3000,
        });
        bridgeInstance.connect().then((isConnected: boolean) => {
          if (timeout) return;
          if (isConnected) {
            resolve(true);
          } else {
            reject({
              error: 200001,
              message: 'timeout, please use AELF Wallet APP or open the page in PC',
            });
          }
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
}
