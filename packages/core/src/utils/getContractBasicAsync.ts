import { WalletInfo } from '../types';

import { getContractBasic as getContractBasicInternal } from '@portkey/contracts';
import { getConfig } from '../config';
import { WalletType } from '../constants';
import { ChainId } from '@portkey/provider-types';
import { IContract } from '@portkey/types';
import { WebLoginInstance } from 'src/injectPortkey';

export default async function getContractBasicAsync(
  walletType: WalletType,
  wallet: WalletInfo,
  contractAddress: string,
): Promise<IContract> {
  const chainId = getConfig().chainId;
  switch (walletType) {
    case WalletType.portkey: {
      const portkeyInstance = new WebLoginInstance().getPortkey();
      const chainsInfo = await portkeyInstance.did.services.getChainsInfo();
      const chainInfo = chainsInfo.find((chain: any) => chain.chainId === chainId);
      if (!chainInfo) {
        throw new Error(`Chain is not running: ${chainId}`);
      }
      return getContractBasicInternal({
        contractAddress,
        callType: 'ca',
        caHash: wallet.portkeyInfo!.caInfo.caHash,
        caContractAddress: chainInfo.caContractAddress,
        account: wallet.portkeyInfo!.walletInfo,
      });
    }
    default:
      throw new Error('Unknown wallet type: ' + walletType);
  }
}
