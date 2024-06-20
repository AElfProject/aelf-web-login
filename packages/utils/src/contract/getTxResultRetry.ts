import AElf from 'aelf-sdk';
import { getTxResult } from '@portkey/contracts';

export function getAElf(rpcUrl?: string) {
  const rpc = rpcUrl || '';
  const httpProviders: any = {};

  if (!httpProviders[rpc]) {
    httpProviders[rpc] = new AElf(new AElf.providers.HttpProvider(rpc));
  }
  return httpProviders[rpc];
}
export async function getTxResultRetry(
  TransactionId: string,
  rpcUrl: string,
  reGetCount = -280,
): Promise<any> {
  try {
    const instance = getAElf(rpcUrl);
    const txResult = await getTxResult(instance, TransactionId, reGetCount);
    if (txResult.Status.toLowerCase() === 'mined') {
      return txResult;
    } else {
      throw Error('Transaction error');
    }
  } catch (e: any) {
    throw Error(e);
  }
}
