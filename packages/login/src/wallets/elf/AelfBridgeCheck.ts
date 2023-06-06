import AElfBridge from 'aelf-bridge';

let aelfBridgeInstance: AelfBridgeCheck | undefined = undefined;

export default class AelfBridgeCheck {
  public check?: () => Promise<boolean>;
  constructor() {
    this.check = async () => {
      return new Promise((resolve, reject) => {
        const bridgeInstance = new AElfBridge({
          timeout: 3000,
        });
        bridgeInstance.connect().then((isConnected: boolean) => {
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
