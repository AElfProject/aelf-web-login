import { useWallet } from '../context';

export default function useCallContract<T, R>(contractAddress: string, methodName: string) {
  const wallet = useWallet();
  return async (args: T) => {
    return await wallet.callContract<T, R>({
      contractAddress,
      methodName,
      args,
    });
  };
}
