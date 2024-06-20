import { AElfDappBridge } from '@aelf-react/types';

// options & connect is aelf-bridge only
export function isAElfBridge(aelfBridge: AElfDappBridge) {
  return !!(aelfBridge.options && aelfBridge.connect);
}
