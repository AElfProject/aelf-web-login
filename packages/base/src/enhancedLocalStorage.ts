export interface Storage {
  getItem(key: string, ...args: Array<any>): any;
  setItem(key: string, value: any, ...args: Array<any>): any;
  removeItem(key: string, ...args: Array<any>): any;
}

const localStorageMock = (function () {
  let store: { [key: string]: string } = {};

  return {
    getItem: function (key: string): string | null {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function (key: string) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

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
  enhancedLocalStorage = localStorageMock;
}
export { enhancedLocalStorage };
