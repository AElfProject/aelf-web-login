import { getContractBasic } from '@portkey/contracts';
import { aelf } from '@portkey/utils';

export interface IRowTransactionPortkeyParams {
  caHash: string;
  privateKey: string;
  contractAddress: string;
  caContractAddress: string;
  rpcUrl: string;
  params: any;
  methodName: string;
}

const getRawTransactionPortkey = async ({
  caHash,
  privateKey,
  contractAddress,
  caContractAddress,
  rpcUrl,
  params,
  methodName,
}: IRowTransactionPortkeyParams) => {
  try {
    const contract = await getContractBasic({
      callType: 'ca',
      caHash: caHash,
      account: aelf.getWallet(privateKey),
      contractAddress: contractAddress,
      caContractAddress: caContractAddress,
      rpcUrl: rpcUrl,
    });

    const a = await contract.encodedTx(methodName, params);

    return a.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
export default getRawTransactionPortkey;
