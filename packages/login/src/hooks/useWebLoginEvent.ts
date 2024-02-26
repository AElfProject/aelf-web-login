import { useEffect } from 'react';
import { Accounts, ChainIds, NetworkType } from '@portkey/provider-types';
import { useWebLogin } from '../context';
import { WebLoginEvents } from '../constants';

export default function useWebLoginEvent(eventType: WebLoginEvents.ERROR, callback: (error: any) => void): void;
export default function useWebLoginEvent(eventType: WebLoginEvents.DISCOVER_DISCONNECTED, callback: () => void): void;
export default function useWebLoginEvent(eventType: WebLoginEvents.USER_CANCEL, callback: () => void): void;
export default function useWebLoginEvent(eventType: WebLoginEvents.LOGINED, callback: () => void): void;
export default function useWebLoginEvent(eventType: WebLoginEvents.LOGOUT, callback: () => void): void;
export default function useWebLoginEvent(eventType: WebLoginEvents.LOGIN_ERROR, callback: (error: any) => void): void;
export default function useWebLoginEvent(
  eventType: WebLoginEvents.NETWORK_MISMATCH,
  callback: (networkType: NetworkType) => void,
): void;
export default function useWebLoginEvent(
  eventType: WebLoginEvents.ACCOUNTS_MISMATCH,
  callback: (accounts: Accounts) => void,
): void;
export default function useWebLoginEvent(
  eventType: WebLoginEvents.CHAINID_MISMATCH,
  callback: (chainIds: ChainIds) => void,
): void;

export default function useWebLoginEvent(
  eventType: WebLoginEvents.CHANGE_PORTKEY_VERSION,
  callback: (version: string) => void,
): void;

export default function useWebLoginEvent<T>(eventType: WebLoginEvents, callback: (data: T) => void) {
  const { eventEmitter } = useWebLogin();
  useEffect(() => {
    eventEmitter.addListener(eventType, callback);
    return () => {
      eventEmitter.removeListener(eventType, callback);
    };
  }, [callback, eventEmitter, eventType]);
}
