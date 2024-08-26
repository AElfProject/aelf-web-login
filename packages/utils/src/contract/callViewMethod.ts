import AElf from 'aelf-sdk';

const CacheViewContracts: { [key: string]: any } = {};
const httpProviders: any = {};
function getAElf(rpc: string) {
  if (!httpProviders[rpc]) httpProviders[rpc] = new AElf(new AElf.providers.HttpProvider(rpc));
  return httpProviders[rpc];
}
const getContract = async (
  endPoint: string,
  contractAddress: string,
  wallet?: any,
): Promise<any> => {
  const key = endPoint + contractAddress;

  if (!CacheViewContracts[key]) {
    if (!wallet) wallet = AElf.wallet.createNewWallet();
    const aelf = getAElf(endPoint);
    const contract = await aelf.chain.contractAt(contractAddress, wallet);
    CacheViewContracts[endPoint + contractAddress] = contract;
    return contract;
  }

  return CacheViewContracts[key];
};

export async function callViewMethod<T, R>({
  endPoint,
  contractAddress,
  methodName,
  args,
  wallet,
}: {
  endPoint: string;
  contractAddress: string;
  methodName: string;
  args: T;
  wallet?: any;
}) {
  const contract = await getContract(endPoint, contractAddress, wallet);
  const rs = contract[methodName].call(args);
  return rs as R;
}
