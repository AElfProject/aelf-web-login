import { SDK } from './sdk';
import setup from './setup';

const setupSDK = (() => {
  let sdk: SDK | undefined = undefined;
  return () => {
    if (sdk) return sdk;
    const delegate = setup();
    sdk = new SDK(delegate);
    return sdk;
  };
})();

export default {
  SDK,
  setupSDK,
};
