import { aelf, sigObjToStr } from '@portkey/utils';
import { handleManagerForwardCall, getContractMethods } from '@portkey/contracts';
import AElf from 'aelf-sdk';
import { MethodsWallet } from '@portkey/provider-types';

type TCreateHandleManagerForwardCall = {
  caContractAddress: string;
  contractAddress: string;
  args: any;
  methodName: string;
  caHash: string;
  instance: any;
};

export type TGetRawTx = {
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
}: TGetRawTx) => {
  const rawTx = AElf.pbUtils.getTransaction(address, contractAddress, functionName, packedInput);
  rawTx.refBlockNumber = blockHeightInput;
  const blockHash = blockHashInput.match(/^0x/) ? blockHashInput.substring(2) : blockHashInput;
  rawTx.refBlockPrefix = Buffer.from(blockHash, 'hex').subarray(0, 4);
  return rawTx;
};

// const getSignature = async ({ provider, data }: { provider: IPortkeyProvider; data: string }) => {
//   const signature = await provider.request({
//     method: MethodsWallet.GET_WALLET_SIGNATURE,
//     payload: { data },
//   });
//   if (!signature || signature.recoveryParam == null) return {}; // TODO
//   const signatureStr = [signature.r, signature.s, `0${signature.recoveryParam.toString()}`].join(
//     '',
//   );
//   return { signature, signatureStr };
// };

export const handleTransaction = async ({
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
  provider,
}: any) => {
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

  // signature
  const sin = await provider.request({
    method: MethodsWallet.GET_WALLET_TRANSACTION_SIGNATURE,
    payload: { data: aelf.encodeTransaction(rawTx) },
  });
  const transaction = aelf.encodeTransaction({
    ...rawTx,
    signature: Buffer.from(sigObjToStr(sin as any), 'hex'),
  });
  return transaction;
};

const createManagerForwardCall = async ({
  caContractAddress,
  contractAddress,
  args,
  methodName,
  caHash,
  instance,
}: TCreateHandleManagerForwardCall) => {
  const res = await handleManagerForwardCall({
    paramsOption: {
      contractAddress,
      methodName,
      args,
      caHash,
    },
    functionName: 'ManagerForwardCall',
    instance,
  });

  res.args = Buffer.from(AElf.utils.uint8ArrayToHex(res.args), 'hex').toString('base64');

  const methods = await getContractMethods(instance, caContractAddress);

  const protoInputType = methods['ManagerForwardCall'];

  let input = AElf.utils.transform.transformMapToArray(protoInputType, res);

  input = AElf.utils.transform.transform(
    protoInputType,
    input,
    AElf.utils.transform.INPUT_TRANSFORMERS,
  );

  const message = protoInputType.fromObject(input);

  return protoInputType.encode(message).finish();
};

export function getAElf(rpcUrl: string) {
  return new AElf(new AElf.providers.HttpProvider(rpcUrl));
}

const getRawTransactionDiscover = async ({
  contractAddress,
  caContractAddress,
  rpcUrl,
  caHash,
  params,
  methodName,
  provider,
}: any) => {
  try {
    const instance = aelf.getAelfInstance(rpcUrl);

    const managerForwardCall = await createManagerForwardCall({
      caContractAddress,
      contractAddress,
      caHash,
      methodName,
      args: params,
      instance,
    });

    const transactionParams = AElf.utils.uint8ArrayToHex(managerForwardCall);

    const aelfInstance = getAElf(rpcUrl);
    const { BestChainHeight, BestChainHash } = await aelfInstance.chain.getChainStatus();

    const fromManagerAddress = await provider.request({
      method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
    });
    const transaction = await handleTransaction({
      blockHeightInput: BestChainHeight,
      blockHashInput: BestChainHash,
      packedInput: transactionParams,
      address: fromManagerAddress,
      contractAddress: caContractAddress,
      functionName: 'ManagerForwardCall',
      provider,
    });
    return transaction;
  } catch (error) {
    console.log(error, 'error===');
    return null;
  }
};

export default getRawTransactionDiscover;
