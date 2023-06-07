import AelfBridgeCheck from './AelfBridgeCheck';
import NightElfCheck from './NightElfCheck';

let checking = 0;
let type = 'unknown';

export function check() {
  return new Promise<string>((resolve) => {
    if (type !== 'unknown') {
      resolve(type);
      return;
    }

    if (checking <= 0) {
      checking++;
      NightElfCheck.getInstance()
        .check()
        .then(() => {
          type = 'NightElf';
        })
        .finally(() => {
          checking--;
        });
      checking++;
      AelfBridgeCheck.getInstance().check!()
        .then(() => {
          type = 'AelfBridge';
        })
        .finally(() => {
          checking--;
        });
    }

    const interval = setInterval(() => {
      if (checking <= 0) {
        if (type === 'unknown') {
          type = 'none';
        }
        clearInterval(interval);
        resolve(type);
      }
    }, 100);
  });
}

export function openPluginPage() {
  const win = window as any;
  win.open('https://chrome.google.com/webstore/search/AELF', '_blank').focus();
}
