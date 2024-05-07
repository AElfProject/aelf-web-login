const ChromeStoreVersion: { [x in string]: string } = {
  v1: 'https://chromewebstore.google.com/detail/hpjiiechbbhefmpggegmahejiiphbmij',
  v2: 'https://chromewebstore.google.com/detail/iglbgmakmggfkoidiagnhknlndljlolb',
  default: 'https://chromewebstore.google.com/detail/iglbgmakmggfkoidiagnhknlndljlolb',
};

export function openNightElfPluginPage() {
  const win = window as any;
  win.open('https://chrome.google.com/webstore/search/AELF', '_blank').focus();
}

export function openPortkeyPluginPage(version = 'v2') {
  const url = ChromeStoreVersion[version] ?? ChromeStoreVersion.default;
  const win = window as any;
  win.open(url, '_blank').focus();
}
