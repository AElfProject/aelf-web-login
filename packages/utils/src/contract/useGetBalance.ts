import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { useCallback, useState } from 'react';

const useGetBalance = ({
  tokenContractAddress,
  account,
  symbol,
  chainId,
}: {
  tokenContractAddress: string;
  account: string;
  symbol: string;
  chainId: TChainId;
}) => {
  const { callViewMethod } = useConnectWallet();
  const [loading, setLoading] = useState(false);

  const getBalance = useCallback(async () => {
    try {
      setLoading(true);
      const rs = await callViewMethod({
        chainId,
        contractAddress: tokenContractAddress,
        methodName: 'GetBalance',
        args: {
          symbol,
          owner: account,
        },
      });
      return rs;
    } catch (e) {
      return 0;
    } finally {
      setLoading(false);
    }
  }, [account, callViewMethod, chainId, symbol, tokenContractAddress]);

  return { getBalance, loading };
};

export { useGetBalance };
