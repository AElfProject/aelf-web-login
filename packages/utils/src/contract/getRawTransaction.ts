import getRawTransactionNight from './getRawTransactionNight';
import getRawTransactionDiscover from './getRawTransactionDiscover';
import getRawTransactionPortkey from './getRawTransactionPortkey';
import { WalletTypeEnum, TWalletInfo } from '@aelf-web-login/wallet-adapter-base';
import { getRawTransactionFairyVault } from './getRawTransactionFairyVault';

interface IRawTransactionPrams {
  walletInfo: TWalletInfo;
  walletType: WalletTypeEnum;
  params: any;
  methodName: string;
  contractAddress: string;
  caContractAddress?: string;
  rpcUrl: string;
  caHash?: string;
}

export const getRawTransaction: (params: IRawTransactionPrams) => Promise<string | null> = async ({
  walletInfo,
  walletType,
  params,
  methodName,
  contractAddress,
  caContractAddress,
  rpcUrl,
  caHash,
}: IRawTransactionPrams) => {
  if (!rpcUrl) return;
  console.log(walletType, 'walletType=');
  let res = null;
  let _caHash = caHash;
  if (!caHash) {
    if (walletType === WalletTypeEnum.discover || walletType === WalletTypeEnum.web)
      _caHash = await walletInfo?.extraInfo?.provider.request({ method: 'caHash' });
  }
  console.log(caContractAddress, 'caContractAddress==');
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
      case WalletTypeEnum.web:
        if (!_caHash) return;
        if (!walletInfo?.extraInfo?.provider) return;
        res = await getRawTransactionDiscover({
          contractAddress,
          caContractAddress,
          rpcUrl,
          caHash: _caHash,
          params,
          methodName,
          provider: walletInfo?.extraInfo?.provider,
        });
        break;
      case WalletTypeEnum.fairyVault:
        if (!walletInfo?.address) return;
        if (!walletInfo?.extraInfo?.provider) return;

        res = await getRawTransactionFairyVault({
          contractAddress,
          params,
          account: { address: walletInfo.address },
          methodName,
          rpcUrl,
          provider: walletInfo?.extraInfo?.provider,
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
