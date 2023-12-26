import { useCallback } from 'react';
import AElf from 'aelf-sdk';
import { ChainId } from '@portkey/provider-types';
import { useWebLogin } from '../context';
import {
  CallContractHookInterface,
  CallContractHookOptions,
  CallContractParams,
  IPortkeySendAdapterProps,
} from '../types';
import { getConfig } from '../config';
import { PORTKEY_ORIGIN_CHAIN_ID_KEY, WalletType, WebLoginEvents } from '../constants';
import { getContractBasic } from '@portkey/contracts';
import { SendOptions } from '@portkey/types';
// import useWebLoginEvent from './useWebLoginEvent';
import { getFaviconUrl, getUrl } from '../utils/getUrl';
import { WebLoginInstance } from '../injectPortkey';

const getAElfInstance = (() => {
  const instances = new Map<string, any>();
  return (rpcUrl: string) => {
    if (!instances.has(rpcUrl)) {
      instances.set(rpcUrl, new AElf(new AElf.providers.HttpProvider(rpcUrl)));
    }
    return instances.get(rpcUrl);
  };
})();

const getViewWallet = (() => {
  let wallet: any;
  return () => {
    if (!wallet) {
      wallet = AElf.wallet.createNewWallet();
    }
    return wallet;
  };
})();

const contractCache = new Map<string, any>();

function useGetContractWithCache(loginId: number, chainId: string, cache: boolean) {
  // useWebLoginEvent(WebLoginEvents.LOGINED, () => {
  //   contractCache.clear();
  // });
  return useCallback(
    async <T>(walletType: WalletType, key: string, createContract: () => Promise<T>) => {
      if (!cache) {
        return await createContract();
      }
      const cacheId = `${loginId}-${chainId}-${walletType}-${key}`;
      let contract = contractCache.get(cacheId);
      if (!contract) {
        contract = await createContract();
        contractCache.set(cacheId, contract);
      }
      return contract as T;
    },
    [cache, chainId, loginId],
  );
}

export const sendAdapter = async <T>({
  caContract,
  didWalletInfo,
  params,
  chainId,
  sendOptions,
}: IPortkeySendAdapterProps<T>) => {
  const portkeyInstance = new WebLoginInstance().getPortkey();
  const chainInfo = await portkeyInstance.getChain(chainId);
  // particular case for token contract(contractMethod: managerApprove)
  // don't deal with caContract(contractMethod: ApproveMethod)
  // if dapp provides signature, we won't awake signature pop-up again
  if ((params.contractAddress === chainInfo?.defaultToken.address && params.methodName) === 'Approve') {
    const { origin, href, hostname: name } = getUrl();
    const icon = getFaviconUrl(href);
    const originChainId = localStorage.getItem(PORTKEY_ORIGIN_CHAIN_ID_KEY);
    // use amount from result of managerApprove not from params
    // dapp user may change amount at pop-up
    const { amount, guardiansApproved } = (await portkeyInstance.managerApprove({
      originChainId,
      targetChainId: chainId,
      caHash: didWalletInfo.caInfo.caHash,
      ...params.args,
      dappInfo: {
        icon,
        href: origin,
        name,
      },
    } as any)) as any;
    return caContract.callSendMethod(
      'ManagerApprove',
      '',
      {
        caHash: didWalletInfo.caInfo.caHash,
        ...params.args,
        guardiansApproved,
        amount,
      },
      {
        onMethod: 'transactionHash',
      },
    );
  } else {
    return caContract.callSendMethod(
      'ManagerForwardCall',
      didWalletInfo.walletInfo.address,
      {
        caHash: didWalletInfo.caInfo.caHash,
        contractAddress: params.contractAddress,
        methodName: params.methodName,
        args: params.args,
      },
      sendOptions,
    );
  }
};

export default function useCallContract(options?: CallContractHookOptions): CallContractHookInterface {
  options = options || {};
  options = {
    cache: true,
    chainId: getConfig().chainId,
    rpcUrl: getConfig().defaultRpcUrl,
    ...options,
  };

  const chainId = options.chainId! as ChainId;
  const viewWallet = getViewWallet();
  const aelfInstance = getAElfInstance(options.rpcUrl!);
  const { loginId, wallet, walletType } = useWebLogin();
  const getContractWithCache = useGetContractWithCache(loginId, chainId, options.cache!);

  const callViewMethod = useCallback(
    async function callContractViewFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      const contract = await getContractWithCache(WalletType.unknown, params.contractAddress, async () => {
        return await aelfInstance.chain.contractAt(params.contractAddress, viewWallet);
      });
      return await contract[params.methodName].call(params.args);
    },
    [aelfInstance.chain, getContractWithCache, viewWallet],
  );
  const callSendMethod = useCallback(
    async function callContractSendFunc<T, R>(
      params: CallContractParams<T>,
      sendOptions: SendOptions | undefined = undefined,
    ): Promise<R> {
      if (walletType === WalletType.unknown) {
        throw new Error('Wallet not login');
      }
      const portkeyInstance = new WebLoginInstance().getPortkey();
      // TODO cache chains info
      const chainsInfo = await portkeyInstance.did.services.getChainsInfo();
      const chainInfo = chainsInfo.find((chain: any) => chain.chainId === chainId);
      if (!chainInfo) {
        throw new Error(`Chain is not running: ${chainId}`);
      }
      const didWalletInfo = wallet.portkeyInfo!;
      const cacheKey = `${chainInfo.caContractAddress}-${didWalletInfo.walletInfo.address}-${chainInfo.endPoint}`;
      const caContract = await getContractWithCache(WalletType.portkey, cacheKey, async () => {
        return await getContractBasic({
          contractAddress: chainInfo.caContractAddress,
          account: didWalletInfo.walletInfo,
          rpcUrl: chainInfo.endPoint,
        });
      });
      const result = await sendAdapter({ caContract, didWalletInfo, params, chainId, sendOptions });
      // compatible with aelf-sdk result of contract
      if (result?.transactionId) {
        const anyResult = result as any;
        anyResult.TransactionId = result?.transactionId;
      }
      return result as R;
    },
    [chainId, getContractWithCache, wallet.address, wallet.portkeyInfo, walletType],
  );

  return {
    contractHookId: `${loginId}_${chainId}_${walletType}}`,
    callViewMethod,
    callSendMethod,
  };
}
