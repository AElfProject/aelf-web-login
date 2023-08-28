import isMobile from 'ismobilejs';

export default function isAElfWallet() {
  const mobile = isMobile(navigator);
  if (!mobile.any) return false;
  const win = window as any;
  return (
    (win.android && mobile.android) ||
    (mobile.apple && win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.JSCallback)
  );
}
