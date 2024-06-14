import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import BigNumber from 'bignumber.js';
import { timesDecimals } from '../calculate';
import { useCallback, useState } from 'react';

interface IGetAllowanceResponse {
  data: {
    symbol: string;
    owner: string;
    spender: string;
    allowance?: number;
    amount?: number;
    error?: Error;
  };
}

interface IGetTokenInfoResponse {
  data: {
    decimals: number;
  };
}
const useCheckAllowanceAndApprove = ({
  tokenContractAddress,
  approveTargetAddress,
  account,
  amount,
  symbol,
  chainId,
}: {
  tokenContractAddress: string;
  approveTargetAddress: string;
  account: string;
  amount: string | number;
  symbol: string;
  chainId: TChainId;
}) => {
  const { callViewMethod, callSendMethod } = useConnectWallet();
  const [loading, setLoading] = useState(false);

  const start = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: allowance }, { data: tokenInfo }] = await Promise.all<
        [Promise<IGetAllowanceResponse>, Promise<IGetTokenInfoResponse>]
      >([
        callViewMethod({
          chainId,
          contractAddress: tokenContractAddress,
          methodName: 'GetAllowance',
          args: {
            symbol,
            owner: account,
            spender: approveTargetAddress,
          },
        }),
        callViewMethod({
          chainId,
          contractAddress: tokenContractAddress,
          methodName: 'GetTokenInfo',
          args: {
            symbol,
          },
        }),
      ]);

      const allowanceBN = new BigNumber(allowance.allowance ?? allowance.amount ?? 0);
      const bigA = timesDecimals(amount, tokenInfo.decimals ?? 8);

      if (allowanceBN.lt(bigA)) {
        const approveAmount = bigA.toNumber();

        await callSendMethod<
          {
            spender: string;
            symbol: string;
            amount: number;
          },
          unknown
        >({
          chainId,
          contractAddress: tokenContractAddress,
          methodName: 'Approve',
          args: {
            spender: approveTargetAddress,
            symbol,
            amount: approveAmount,
          },
        });
        return true;
      }
      return true;
    } catch (e) {
      return e;
    } finally {
      setLoading(false);
    }
  }, [
    account,
    amount,
    approveTargetAddress,
    callSendMethod,
    callViewMethod,
    chainId,
    symbol,
    tokenContractAddress,
  ]);

  return { start, loading };
};

export { useCheckAllowanceAndApprove };
