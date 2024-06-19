import { getContractBasic } from '@portkey/contracts';

export interface CreateTransactionParamsOfNight {
  contractAddress: string;
  params: any;
  methodName: string;
  rpcUrl: string;
  account: { address: string };
}

async function getRawTransactionNight({
  account,
  contractAddress,
  params,
  methodName,
  rpcUrl,
}: CreateTransactionParamsOfNight) {
  const contract = await getContractBasic({
    account: account,
    contractAddress: contractAddress,
    rpcUrl: rpcUrl,
  });
  const rs = await contract.encodedTx(methodName, params);
  return rs.data;
}

export default getRawTransactionNight;
