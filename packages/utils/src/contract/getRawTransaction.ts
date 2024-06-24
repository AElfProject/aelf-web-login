import { WalletTypeEnum, TWalletInfo } from '@aelf-web-login/wallet-adapter-base';

import getRawTransactionNight from './getRawTransactionNight';
import getRawTransactionDiscover from './getRawTransactionDiscover';
import getRawTransactionPortkey from './getRawTransactionPortkey';

interface IRawTransactionPrams {
  walletInfo: TWalletInfo;
  walletType: WalletTypeEnum;
  params: any;
  methodName: string;
  contractAddress: string;
  caContractAddress?: string;
  rpcUrl: string;
}

export const getRawTransaction: (params: IRawTransactionPrams) => Promise<string | null> = async ({
  walletInfo,
  walletType,
  params,
  methodName,
  contractAddress,
  caContractAddress,
  rpcUrl,
}: IRawTransactionPrams) => {
  if (!rpcUrl) return;

  let res = null;

  try {
    switch (walletType) {
      case WalletTypeEnum.aa:
        if (!walletInfo?.extraInfo?.portkeyInfo) return;
        res = await getRawTransactionPortkey({
          caHash: walletInfo.extraInfo.portkeyInfo.caInfo.caHash,
          privateKey: walletInfo.extraInfo.portkeyInfo.walletInfo.privateKey,
          contractAddress,
          caContractAddress: caContractAddress ?? '',
          rpcUrl,
          params,
          methodName,
        });
        break;
      case WalletTypeEnum.discover:
        if (!walletInfo?.address) return;
        res = await getRawTransactionDiscover({
          caAddress: walletInfo.address,
          contractAddress,
          caContractAddress,
          rpcUrl,
          params,
          methodName,
        });
        break;
      case WalletTypeEnum.elf:
        if (!walletInfo?.address) return;
        res = await getRawTransactionNight({
          contractAddress,
          params,
          account: { address: walletInfo.address },
          methodName,
          rpcUrl,
        });
        break;
    }

    return res;
  } catch (error) {
    console.log('getRawTransaction error', error);

    return null;
  }
};
