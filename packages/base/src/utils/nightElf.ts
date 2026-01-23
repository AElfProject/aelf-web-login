import { Storage } from '../enhancedLocalStorage';
import { WalletTypeEnum } from '../types';

export function checkPrevLoginType(type = WalletTypeEnum.aa, storage: Storage = localStorage) {
  return storage.getItem('connectedWallet') === type;
}

export function checkConnectedWallet(type = WalletTypeEnum.aa, storage: Storage = localStorage) {
  try {
    if (checkPrevLoginType(type)) storage.removeItem('connectedWallet');
  } catch (error) {
    console.log(error, '====checkConnectedWallet');
  }
}

export async function checkNightElf(): Promise<boolean> {
  let resolveTemp: ((arg0: boolean) => void) | undefined = undefined;
  async function check(): Promise<boolean> {
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
  }
  if (typeof window !== 'undefined') {
    document.addEventListener('NightElf', () => {
      resolveTemp?.(true);
    });
  }

  try {
    return await check();
  } catch (error) {
    console.log(error, '====checkNightElf');
    return false;
  }
}
