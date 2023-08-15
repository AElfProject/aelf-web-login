import React, { createContext, useContext, useMemo, useRef } from 'react';
import { PortkeyProvider, SignIn, SignInInterface } from '@portkey/did-ui-react';
import { PortkeyUISDK } from './PortkeyUISDK';
import ExtraElement from './ExtraElement';
import { PortkeyState } from '../types';

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

export function usePortkeyState(): PortkeyState {
  return useContext(PortkeySDKContext);
}

export function PortkeySDKProvider({
  customPortkeySDK,
  customPortkeyUI,
  children,
  chainType,
  networkType,
  theme,
  uiType,
  design,
  defaultChainId,
}: PortkeySDKProviderProps) {
  const signInRef = useRef<SignInInterface>(null);
  const portkeySDK = useMemo(
    () => {
      if (customPortkeySDK) {
        if (typeof customPortkeySDK === 'function') {
          return customPortkeySDK();
        }
        return customPortkeySDK;
      }
      const sdk = new PortkeyUISDK(
        {
          chainType,
          networkType,
          theme,
          uiType,
          defaultChainId,
          design,
        },
        signInRef,
      );
      return sdk;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const value = useMemo(
    () => ({ defaultChainId, chainType, networkType, theme, uiType, design, portkeySDK }),
    [chainType, defaultChainId, design, networkType, portkeySDK, theme, uiType],
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
        <SignIn
          ref={signInRef}
          design={design}
          uiType={uiType}
          defaultChainId={defaultChainId}
          extraElement={<ExtraElement />}
          onCancel={() => portkeySDK.onCancel()}
          onError={(error) => portkeySDK.onError(error)}
          onFinish={(didWalletInfo) => portkeySDK.onFinish(didWalletInfo)}
        />
      </>
    );
  };

  return (
    <PortkeyProvider chainType={chainType} networkType={networkType} theme={theme}>
      <PortkeySDKContext.Provider value={value}>{renderChildren()}</PortkeySDKContext.Provider>;
    </PortkeyProvider>
  );
}
