import { WalletInfo } from '../../types';

import { getContractBasic as getContractBasicInternal } from '@portkey/contracts';
import { did } from '@portkey/did-ui-react';
import { getConfig } from '../../config';
import { WalletType } from '../../constants';
import { ChainId } from '@portkey/provider-types';
import { IContract } from '@portkey/types';

export default async function getContractBasicAsync(
  walletType: WalletType,
  wallet: WalletInfo,
  contractAddress: string,
): Promise<IContract> {
  const chainId = getConfig().chainId;
  switch (walletType) {
    case WalletType.discover: {
      const chain = await wallet.discoverInfo!.provider!.getChain(chainId as ChainId);
      return getContractBasicInternal({
        contractAddress,
        chainProvider: chain,
      });
    }
    case WalletType.elf:
      return getContractBasicInternal({
        contractAddress,
        aelfInstance: wallet.nightElfInfo!.aelfBridges![getConfig().chainId],
        account: {
          address: wallet.nightElfInfo!.account!,
        },
      });
    case WalletType.portkey: {
      const chainsInfo = await did.services.getChainsInfo();
      const chainInfo = chainsInfo.find((chain) => chain.chainId === chainId);
      if (!chainInfo) {
        throw new Error(`Chain is not running: ${chainId}`);
      }
      return getContractBasicInternal({
        contractAddress,
        callType: 'ca',
        caHash: wallet.portkeyInfo!.caInfo?.caHash,
        caContractAddress: chainInfo.caContractAddress,
        account: wallet.portkeyInfo!.walletInfo,
      });
    }
    default:
      throw new Error('Unknown wallet type: ' + walletType);
  }
}
