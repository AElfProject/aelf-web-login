export interface Storage {
  getItem(key: string, ...args: Array<any>): any;
  setItem(key: string, value: any, ...args: Array<any>): any;
  removeItem(key: string, ...args: Array<any>): any;
}

// let enhancedLocalStorage: Storage = {} as Storage;
// if (typeof window !== 'undefined') {
//   enhancedLocalStorage = window.localStorage;
// } else {
//   import('node-localstorage').then(({ LocalStorage }) => {
//     enhancedLocalStorage = new LocalStorage('./scratch');
//   });
// }
// export { enhancedLocalStorage };

let enhancedLocalStorage: Storage;
if (typeof window !== 'undefined') {
  enhancedLocalStorage = localStorage;
} else {
  enhancedLocalStorage = {} as Storage;
}
export { enhancedLocalStorage };
