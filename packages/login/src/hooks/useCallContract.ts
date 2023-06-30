import { useCallback, useMemo } from 'react';
import AElf from 'aelf-sdk';
import { ChainId } from '@portkey/provider-types';
import { did } from '@portkey/did-ui-react';
import { useWebLogin } from '../context';
import { CallContractHookInterface, CallContractHookOptions, CallContractParams } from '../types';
import { getConfig } from '../config';
import { WalletType } from '../constants';
import { getContractBasic } from '@portkey/contracts';

function useAElfInstance(rpcUrl: string) {
  return useMemo(() => {
    return new AElf(new AElf.providers.HttpProvider(rpcUrl));
  }, [rpcUrl]);
}

function useViewWallet() {
  return useMemo(() => {
    return AElf.wallet.createNewWallet();
  }, []);
}

// TODO: cache contracts
export default function useCallContract(options?: CallContractHookOptions): CallContractHookInterface {
  options = options || {};
  options = {
    cache: true,
    chainId: getConfig().chainId,
    rpcUrl: getConfig().defaultRpcUrl,
    ...options,
  };

  const viewWallet = useViewWallet();
  const chainId = options.chainId!;
  const aelfInstance = useAElfInstance(options.rpcUrl!);
  const { wallet, walletType } = useWebLogin();

  const callViewMethod = useCallback(
    async function callContractViewFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      const contract = await aelfInstance.chain.contractAt(params.contractAddress, viewWallet);
      return await contract[params.methodName].call(params.args);
    },
    [aelfInstance.chain, viewWallet],
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
          const contract = chain.getContract(params.contractAddress);
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
          const contract = await chain.contractAt(params.contractAddress, {
            address: wallet.address,
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
          const caContract = await getContractBasic({
            contractAddress: chainInfo.caContractAddress,
            account: didWalletInfo.walletInfo,
            rpcUrl: chainInfo.endPoint,
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
    [chainId, wallet.address, wallet.discoverInfo, wallet.nightElfInfo, wallet.portkeyInfo, walletType],
  );

  return {
    callViewMethod,
    callSendMethod,
  };
}
