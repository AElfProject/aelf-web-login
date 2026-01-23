import { isMobileDevices } from './isMobile';
import { getOriginalAddress } from './getOriginalAddress';
import { isPortkeyApp } from './isPortkeyApp';
import { isFairyVaultApp } from './isFairyVaultApp';
import { sleep } from './sleep';
import { checkConnectedWallet, checkNightElf, checkPrevLoginType } from './nightElf';

export default {
  isMobileDevices,
  getOriginalAddress,
  isPortkeyApp,
  isFairyVaultApp,
  sleep,
  checkConnectedWallet,
  checkNightElf,
  checkPrevLoginType,
};
