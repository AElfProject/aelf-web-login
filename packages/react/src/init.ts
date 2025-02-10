import {
  type IBridgeAPI,
  type IConfigProps,
  initBridge,
} from '@aelf-web-login/wallet-adapter-bridge';

let isTGScriptInjected = false;
export const init = (options: IConfigProps): IBridgeAPI => {
  if (options.baseConfig.showVconsole && typeof window !== 'undefined') {
    import('vconsole')
      .then((VConsole) => new VConsole.default())
      .catch((err) => console.log('Error loading VConsole:', err));
  }
  console.log('aelf-web-login-init..............31');
  function initScriptAndMountApp() {
    if (isTGScriptInjected || options.baseConfig.omitTelegramScript) {
      return;
    }
    // const HOSTNAME_PREFIX_LIST = ['tg.', 'tg-test.', 'localhost'];
    const TELEGRAM_SRC = 'https://telegram.org/js/telegram-web-app.js';
    if (typeof window !== 'undefined' && typeof location !== 'undefined') {
      // if (HOSTNAME_PREFIX_LIST.some(h => location.hostname.includes(h))) {
      const script = document.createElement('script');
      script.src = TELEGRAM_SRC;
      script.async = false;
      document.head.appendChild(script);
      console.log('initScriptAndMountApp');
      isTGScriptInjected = true;
      // }
    }
  }

  initScriptAndMountApp();
  const dataFromBridge = initBridge(options);
  return dataFromBridge;
};
