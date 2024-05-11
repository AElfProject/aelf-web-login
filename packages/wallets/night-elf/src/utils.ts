import { INightElfWalletAdapterConfig } from './index';
import { makeError, utils, ERR_CODE } from '@aelf-web-login/wallet-adapter-base';
import type { AElfDappBridge, PublicKey } from '@aelf-react/types';
import AelfBridgeCheck from './AelfBridgeCheck';
import NightElfCheck from './NightElfCheck';

export const getBridges = async (nodes: INightElfWalletAdapterConfig['nodes'], appName: string) => {
  const { isMobile } = utils;
  try {
    const isAElfBridge = isMobile() && !(window as any)?.NightElf;
    const connector = (
      await (isAElfBridge ? import('./AelfBridgeCheck') : import('./NightElfCheck'))
    ).default;
    // check connector
    await connector.getInstance().check();

    let firstKey = '';
    const bridges: { [key: string]: AElfDappBridge } = {};
    if (!nodes || Object.keys(nodes).length === 0) {
      throw makeError(ERR_CODE.INIT_BRIDGE_ERROR);
    }
    Object.entries(nodes).forEach(([k, v]) => {
      if (!firstKey) firstKey = k;
      bridges[k] = connector.initAelfInstanceByExtension(v.rpcUrl, appName);
    });
    const node = nodes[firstKey];
    const bridge = bridges[firstKey];
    return { bridge, node, bridges };
  } catch (e) {
    throw makeError(ERR_CODE.INIT_BRIDGE_ERROR);
  }
};

export const detectNightElf = async () => {
  let checking = 0;
  let type = 'unknown';
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
        .catch((error) => {
          console.log(error.message);
        })
        .finally(() => {
          checking--;
        });
      checking++;
      AelfBridgeCheck.getInstance().check!()
        .then(() => {
          type = 'AelfBridge';
        })
        .catch((error) => {
          console.log(error.message);
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
};

const toStr = (x: string, y: string) => '04' + x?.padStart(64, '0') + y?.padStart(64, '0');

const formatPubKey = (publicKey: PublicKey | string) => {
  try {
    const { x, y } = (typeof publicKey === 'object' ? publicKey : JSON.parse(publicKey)) || {};
    return toStr(x, y);
  } catch (e) {
    return publicKey;
  }
};

export const formatLoginInfo = (loginInfo: string) => {
  const detail = JSON.parse(loginInfo);
  const account = detail.address;
  const pubKey = formatPubKey(detail.publicKey);
  delete detail.address;
  return { ...detail, account, pubKey, all: detail };
};
