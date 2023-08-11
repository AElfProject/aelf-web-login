import React, { createContext, useContext, useMemo } from 'react';
import { PortkeyProvider, SignIn } from '@portkey/did-ui-react';
import { PortkeyState, PortkeyUISDK } from './PortkeyUISDK';

export type PortkeySDKProviderProps = PortkeyState & {
  customPortkeySDK?: PortkeyUISDK | (() => PortkeyUISDK);
  customPortkeyUI?: boolean;
  children: React.ReactNode | ((portkeySDK: PortkeyUISDK) => React.ReactNode);
};

type PortkeySDKContextType = PortkeyState & {
  portkeySDK: PortkeyUISDK;
};

const PortkeySDKContext = createContext<PortkeySDKContextType>({} as PortkeySDKContextType);

export function usePortkeyUISDK() {
  return useContext(PortkeySDKContext).portkeySDK;
}

export function PortkeySDKProvider({
  customPortkeySDK,
  customPortkeyUI,
  children,
  chainType,
  networkType,
  theme,
  sandboxId,
}: PortkeySDKProviderProps) {
  const portkeySDK = useMemo(
    () => {
      if (customPortkeySDK) {
        if (typeof customPortkeySDK === 'function') {
          return customPortkeySDK();
        }
        return customPortkeySDK;
      }
      const sdk = new PortkeyUISDK({
        chainType,
        networkType,
        theme,
        sandboxId,
      });
      return sdk;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const value = useMemo(
    () => ({ chainType, networkType, theme, sandboxId, portkeySDK }),
    [chainType, networkType, portkeySDK, sandboxId, theme],
  );

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(portkeySDK);
    }

    if (customPortkeyUI) {
      return children;
    }

    return (
      <>
        {children}
        <SignIn onCancel={portkeySDK.onCancel} onError={portkeySDK.onError} onFinish={portkeySDK.onFinish} />
      </>
    );
  };

  return (
    <PortkeyProvider chainType={chainType} networkType={networkType} theme={theme} sandboxId={sandboxId}>
      <PortkeySDKContext.Provider value={value}>{renderChildren()}</PortkeySDKContext.Provider>;
    </PortkeyProvider>
  );
}
