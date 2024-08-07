let nightElfInstance: NightElfCheck;
let aelfInstanceByExtension;

export default class NightElfCheck {
  public check: () => Promise<boolean>;
  constructor() {
    let resolveTemp = (value: boolean) => {
      console.log('resolveTemp', value);
    };
    this.check = async () => {
      return new Promise((resolve, reject) => {
        const win = window as any;
        if (win.NightElf) {
          console.log('There is NightElf');
          resolve(true);
          return;
        }
        setTimeout(() => {
          reject({
            error: 200001,
            message: 'timeout, please download and install the NightELF explorer extension',
          });
        }, 5000);
        resolveTemp = resolve;
      });
    };
    if (typeof window !== 'undefined') {
      document.addEventListener('NightElf', () => {
        resolveTemp(true);
      });
    }
  }
  static getInstance() {
    if (nightElfInstance) return nightElfInstance;
    nightElfInstance = new NightElfCheck();
    return nightElfInstance;
  }
  static initAelfInstanceByExtension(rpcUrl: string, appName: string) {
    const win = window as any;
    if (!win.NightElf) {
      return;
    }
    aelfInstanceByExtension = new win.NightElf.AElf({
      httpProvider: [rpcUrl],
      appName,
    });
    return aelfInstanceByExtension;
  }
}
