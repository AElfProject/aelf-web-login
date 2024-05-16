import { LocalStorage } from 'node-localstorage';

export interface Storage {
  getItem(key: string, ...args: Array<any>): any;
  setItem(key: string, value: any, ...args: Array<any>): any;
  removeItem(key: string, ...args: Array<any>): any;
}

let enhancedLocalStorage: Storage = {} as Storage;
if (typeof localStorage === 'undefined' || localStorage === null) {
  enhancedLocalStorage = new LocalStorage('./scratch');
} else {
  enhancedLocalStorage = localStorage;
}
export { enhancedLocalStorage };
