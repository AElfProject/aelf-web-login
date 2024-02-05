import * as PortkeyDid from '@portkey/did-ui-react';
import * as PortkeyDidV1 from '@portkey-v1/did-ui-react';
import { useEffect, useMemo, useState } from 'react';
import { WEB_LOGIN_VERSION, WebLoginEvents } from '../constants';
import { useWebLogin } from '../context';
import useWebLoginEvent from '../hooks/useWebLoginEvent';

export const useDidComponent = (v?: string) => {
  const { version } = useWebLogin();
  const [didComp, setDidComp] = useState<any>(
    v ? (v === 'v1' ? PortkeyDidV1 : PortkeyDid) : version === 'v1' ? PortkeyDidV1 : PortkeyDid,
  );

  useEffect(() => {
    if (v) {
      setDidComp(v === 'v1' ? PortkeyDidV1 : PortkeyDid);
    } else {
      setDidComp(version === 'v1' ? PortkeyDidV1 : PortkeyDid);
    }
  }, [version]);

  return useMemo(() => didComp, [didComp]);
};
