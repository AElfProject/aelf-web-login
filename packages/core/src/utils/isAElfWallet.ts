import isMobile from 'ismobilejs';

const mobile = isMobile(window.navigator);

export default function isAElfWallet() {
  if (!mobile.any) return false;
  const win = window as any;
  return (
    ('android' in window && mobile.android) ||
    (mobile.apple && win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.JSCallback)
  );
}
