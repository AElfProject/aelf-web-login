import { getContractMethods } from '@portkey/contracts';
import { IPortkeyProvider } from '@portkey/provider-types';
import { aelf } from '@portkey/utils';
import AElf from 'aelf-sdk';

const getSignature = async ({
  provider,
  data,
  address,
}: {
  provider: any;
  data: string;
  address: string;
}) => {
  try {
    const result = await provider.getSignature({
      address,
      hexToBeSign: data,
    });
    if (result?.errorMessage) {
      return Promise.reject(result.errorMessage);
    }
    return result.signature;
  } catch (error) {
    console.log('getSignature error', error);
    return Promise.reject(error);
  }
};

export type GetRawTx = {
  blockHeightInput: string;
  blockHashInput: string;
  packedInput: string;
  address: string;
  contractAddress: string;
  functionName: string;
};

export const getRawTx = ({
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
}: GetRawTx) => {
  const rawTx = AElf.pbUtils.getTransaction(address, contractAddress, functionName, packedInput);
  rawTx.refBlockNumber = blockHeightInput;
  const blockHash = blockHashInput.match(/^0x/) ? blockHashInput.substring(2) : blockHashInput;
  rawTx.refBlockPrefix = Buffer.from(blockHash, 'hex').slice(0, 4);
  return rawTx;
};

export const handleTransaction = async ({
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
  provider,
}: GetRawTx & { provider: IPortkeyProvider }) => {
  try {
    // Create transaction
    const rawTx = getRawTx({
      blockHeightInput,
      blockHashInput,
      packedInput,
      address,
      contractAddress,
      functionName,
    });
    rawTx.params = Buffer.from(rawTx.params, 'hex');

    const ser = AElf.pbUtils.Transaction.encode(rawTx).finish();

    const m = AElf.utils.sha256(ser);
    // signature
    const signatureStr = await getSignature({ provider, data: m, address });
    console.log('=====signatureStr', signatureStr);

    if (!signatureStr) return;

    let tx = {
      ...rawTx,
      signature: Buffer.from(signatureStr, 'hex'),
    };

    tx = AElf.pbUtils.Transaction.encode(tx).finish();
    if (tx instanceof Buffer) {
      return tx.toString('hex');
    }
    return AElf.utils.uint8ArrayToHex(tx); // hex params
  } catch (error) {
    return Promise.reject(error);
  }
};

export interface CreateTransactionParamsOfNight {
  contractAddress: string;
  params: any;
  methodName: string;
  rpcUrl: string;
  account: { address: string };
}

type IHandleTransactionParams = {
  contractAddress: string;
  args: any;
  methodName: string;
  instance: any;
};

export const handleTransactionParams = async ({
  contractAddress,
  args,
  methodName,
  instance,
}: IHandleTransactionParams) => {
  const methods = await getContractMethods(instance, contractAddress);
  const protoInputType = methods[methodName];

  let input = AElf.utils.transform.transformMapToArray(protoInputType, args);

  input = AElf.utils.transform.transform(
    protoInputType,
    input,
    AElf.utils.transform.INPUT_TRANSFORMERS,
  );

  const message = protoInputType.fromObject(input);

  return protoInputType.encode(message).finish();
};

async function getRawTransactionNight({
  account,
  contractAddress,
  params,
  methodName,
  rpcUrl,
}: CreateTransactionParamsOfNight) {
  const provider = new (window as any).NightElf.AElf({
    httpProvider: [rpcUrl],
    appName: 'APP_NAME',
    pure: true,
  });

  try {
    const instance = aelf.getAelfInstance(rpcUrl);

    const result = await handleTransactionParams({
      contractAddress,
      methodName,
      args: params,
      instance,
    });

    const transactionParams = AElf.utils.uint8ArrayToHex(result);

    const { BestChainHeight, BestChainHash } = await instance.chain.getChainStatus();

    const transaction = await handleTransaction({
      blockHeightInput: BestChainHeight,
      blockHashInput: BestChainHash,
      packedInput: transactionParams,
      address: account.address,
      contractAddress,
      functionName: methodName,
      provider,
    });
    return transaction;
  } catch (error) {
    return Promise.reject(error);
  }
}

export default getRawTransactionNight;
