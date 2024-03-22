import * as PortkeyDid from '@portkey/did-ui-react';
import * as PortkeyDidV1 from '@portkey-v1/did-ui-react';
import { useEffect, useMemo, useState } from 'react';
import { WebLoginEvents } from '../constants';
import { useWebLogin } from '../context';
import useWebLoginEvent from '../hooks/useWebLoginEvent';
import { getConfig } from '../config';
import { getStorageVersion } from './getUrl';

export const useComponentFlex = (v?: string) => {
  const WEB_LOGIN_VERSION = getStorageVersion();
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

export const addPrefix = (appName: string, prefix = 'V2') => {
  return `${prefix}-${appName}`;
};

export const useAppNameFlex = (v?: string) => {
  const { version } = useWebLogin();
  const appNameV1 = getConfig().appName;
  const appNameV2 = addPrefix(appNameV1);
  const [appName, setAppName] = useState<any>(
    v ? (v === 'v1' ? appNameV1 : appNameV2) : version === 'v1' ? appNameV1 : appNameV2,
  );
  useEffect(() => {
    if (v) {
      setAppName(v === 'v1' ? appNameV1 : appNameV2);
    } else {
      console.log(appNameV1, appNameV2, 'appNameV1 : appNameV2');
      setAppName(version === 'v1' ? appNameV1 : appNameV2);
    }
  }, [version]);

  return useMemo(() => appName, [appName]);
};
