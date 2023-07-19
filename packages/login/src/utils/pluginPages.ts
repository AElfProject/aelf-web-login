export function openNightElfPluginPage() {
  const win = window as any;
  win.open('https://chrome.google.com/webstore/search/AELF', '_blank').focus();
}

export function openPortkeyPluginPage() {
  const win = window as any;
  win
    .open('https://chrome.google.com/webstore/detail/portkey-did-crypto-nft/hpjiiechbbhefmpggegmahejiiphbmij', '_blank')
    .focus();
}
