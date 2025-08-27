import { aelf } from '@portkey/utils';
import AElf from 'aelf-sdk';
import { handleTransactionParams } from './getRawTransactionNight';
import { getAElf, handleTransaction } from './getRawTransactionDiscover';

export const getRawTransactionFairyVault = async ({
  account,
  contractAddress,
  params,
  methodName,
  rpcUrl,
  provider,
}: any) => {
  try {
    const instance = aelf.getAelfInstance(rpcUrl);

    const result = await handleTransactionParams({
      contractAddress,
      methodName,
      args: params,
      instance,
    });

    const transactionParams = AElf.utils.uint8ArrayToHex(result);

    const aelfInstance = getAElf(rpcUrl);
    const { BestChainHeight, BestChainHash } = await aelfInstance.chain.getChainStatus();

    return await handleTransaction({
      blockHeightInput: BestChainHeight,
      blockHashInput: BestChainHash,
      packedInput: transactionParams,
      address: account.address,
      contractAddress,
      functionName: methodName,
      provider,
    });
  } catch (error) {
    console.log(error, 'error===');
    return null;
  }
};
