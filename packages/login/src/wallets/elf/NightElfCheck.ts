let nightElfInstance: NightElfCheck | undefined = undefined;

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
    document.addEventListener('NightElf', () => {
      resolveTemp(true);
    });
  }
  static getInstance() {
    if (nightElfInstance) return nightElfInstance;
    nightElfInstance = new NightElfCheck();
    return nightElfInstance;
  }
}
