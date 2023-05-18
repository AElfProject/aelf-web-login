import { useRef, useEffect } from 'react';

export default function useBoolLockEffect(
  callback: () => void,
  deps: React.DependencyList,
): React.MutableRefObject<boolean> {
  const lockRef = useRef(false);
  lockRef.current = false;

  useEffect(() => {
    if (!lockRef.current) {
      callback();
    }
  }, deps);
  return lockRef;
}
