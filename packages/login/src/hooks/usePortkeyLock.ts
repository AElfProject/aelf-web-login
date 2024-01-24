import { useWebLoginContext } from '../context';
import { PortkeyInterface } from '../wallets/portkey/usePortkey';

export default function usePortkeyLock() {
  const webLoginContext = useWebLoginContext();
  const portkey = webLoginContext._api.portkey as PortkeyInterface;
  return {
    isUnlocking: portkey.isUnlocking,
    lock: portkey.lock,
  };
}
