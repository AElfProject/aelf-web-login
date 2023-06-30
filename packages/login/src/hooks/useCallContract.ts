import { useCallback } from 'react';
import AElf from 'aelf-sdk';
import { ChainId } from '@portkey/provider-types';
import { did } from '@portkey/did-ui-react';
import { useWebLogin } from '../context';
import { CallContractHookInterface, CallContractHookOptions, CallContractParams } from '../types';
import { getConfig } from '../config';
import { WalletType } from '../constants';
import { getContractBasic } from '@portkey/contracts';

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

function useGetContractWithCache(chainId: string, cache: boolean) {
  return useCallback(
    async <T>(walletType: WalletType, address: string, createContract: () => Promise<T>) => {
      if (!cache) {
        return await createContract();
      }
      const cacheId = `${chainId}-${walletType}-${address}`;
      let contract = contractCache.get(cacheId);
      if (!contract) {
        contract = await createContract();
        contractCache.set(cacheId, contract);
      }
      return contract as T;
    },
    [cache, chainId],
  );
}

export default function useCallContract(options?: CallContractHookOptions): CallContractHookInterface {
  options = options || {};
  options = {
    cache: true,
    chainId: getConfig().chainId,
    rpcUrl: getConfig().defaultRpcUrl,
    ...options,
  };

  const chainId = options.chainId!;
  const viewWallet = getViewWallet();
  const aelfInstance = getAElfInstance(options.rpcUrl!);
  const { wallet, walletType } = useWebLogin();
  const getContractWithCache = useGetContractWithCache(chainId, options.cache!);

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
    async function callContractSendFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      if (walletType === WalletType.unknown) {
        throw new Error('Wallet not login');
      }
      switch (walletType) {
        case WalletType.discover: {
          const discoverInfo = wallet.discoverInfo!;
          const chain = await discoverInfo.provider!.getChain(chainId as ChainId);
          const contract = await getContractWithCache(WalletType.unknown, params.contractAddress, async () => {
            return chain.getContract(params.contractAddress);
          });
          const accounts = discoverInfo.accounts;
          const accountsInChain = accounts[chainId as ChainId];
          if (!accountsInChain || accountsInChain.length === 0) {
            throw new Error(`Account not found in chain: ${chainId}`);
          }
          const address = accountsInChain[0];
          const result = contract.callSendMethod(params.methodName, address, params.args);
          return result as R;
        }
        case WalletType.elf: {
          const bridges = wallet.nightElfInfo!.aelfBridges;
          if (!bridges) {
            throw new Error('NightElf bridges not found');
          }
          if (!bridges[chainId] || !bridges[chainId]!.chain) {
            throw new Error(`Bridge of ${chainId} not found in NightElf`);
          }
          const chain = bridges[chainId]!.chain;
          const contract = await getContractWithCache(WalletType.unknown, params.contractAddress, async () => {
            return await chain.contractAt(params.contractAddress, {
              address: wallet.address,
            });
          });
          return await contract[params.methodName](params.args);
        }
        case WalletType.portkey: {
          // TODO cache chains info
          const chainsInfo = await did.services.getChainsInfo();
          const chainInfo = chainsInfo.find((chain) => chain.chainId === chainId);
          if (!chainInfo) {
            throw new Error(`Chain is not running: ${chainId}`);
          }
          const didWalletInfo = wallet.portkeyInfo!;
          const caContract = await getContractWithCache(WalletType.unknown, params.contractAddress, async () => {
            return await getContractBasic({
              contractAddress: chainInfo.caContractAddress,
              account: didWalletInfo.walletInfo,
              rpcUrl: chainInfo.endPoint,
            });
          });
          const result = await caContract.callSendMethod('ManagerForwardCall', didWalletInfo.walletInfo.address, {
            caHash: didWalletInfo.caInfo.caHash,
            contractAddress: params.contractAddress,
            methodName: params.methodName,
            args: params.args,
          });
          // compatible with aelf-sdk result of contract
          if (result.transactionId) {
            const anyResult = result as any;
            anyResult.TransactionId = result.transactionId;
          }
          return result as R;
        }
      }
    },
    [
      chainId,
      getContractWithCache,
      wallet.address,
      wallet.discoverInfo,
      wallet.nightElfInfo,
      wallet.portkeyInfo,
      walletType,
    ],
  );

  return {
    callViewMethod,
    callSendMethod,
  };
}
