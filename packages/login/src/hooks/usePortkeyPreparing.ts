import { useWebLoginContext } from '../context';
import { PortkeyInterface } from '../wallets/portkey/usePortkey';

export default function usePortkeyPreparing() {
  const webLoginContext = useWebLoginContext();
  const portkey = webLoginContext._api.portkey as PortkeyInterface;
  return {
    isPreparing: portkey.isPreparing,
  };
}
