import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PortkeyProvider, SignIn, SignInInterface, Unlock, did } from '@portkey/did-ui-react';
import { PortkeyUISDK } from './PortkeyUISDK';
import ExtraElement from './ExtraElement';
import { PortkeyState } from '../types';

export type PortkeySDKProviderProps = PortkeyState & {
  appName: string;
  customPortkeySDK?: PortkeyUISDK | (() => PortkeyUISDK);
  customPortkeyUI?: boolean;
  showNightElf?: boolean;
  showDiscover?: boolean;
  socialDesign?:
    | {
        logo?: string | undefined;
        title?: string | undefined;
      }
    | undefined;
  children: React.ReactNode;
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

export function PortkeySDKProvider(props: PortkeySDKProviderProps) {
  const { customPortkeySDK, customPortkeyUI, children, chainType, networkType, theme, uiType, design, defaultChainId } =
    props;
  const signInRef = useRef<SignInInterface>(null);
  const [password, setPassword] = useState('');
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [isWrongPassword, setIsWrongPassword] = useState(false);

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
        setUnlockOpen,
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

  const onUnlockInternal = async () => {
    let localWallet;
    try {
      localWallet = await did.load(password, props.appName);
      if (!localWallet) {
        setIsWrongPassword(true);
        return;
      }
      if (!localWallet.didWallet.accountInfo.loginAccount) {
        setIsWrongPassword(true);
        return;
      }
      setIsWrongPassword(false);
      setPassword('');

      // const didWalletInfo: DIDWalletInfo = {
      //   pin: password,
      //   chainId: originChainId as ChainId,
      //   walletInfo: localWallet.didWallet.managementAccount!.wallet as any,
      //   accountInfo: localWallet.didWallet.accountInfo as any,
      // };
    } catch (error) {
      setIsWrongPassword(true);
      return;
    }
  };

  useEffect(() => {
    portkeySDK.setUnlockOpen = setUnlockOpen;
  }, [portkeySDK, setUnlockOpen]);

  const renderChildren = () => {
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
          extraElement={<ExtraElement {...props} />}
          onCancel={() => portkeySDK.onCancel()}
          onError={(error) => portkeySDK.onError(error)}
          onFinish={(didWalletInfo) => portkeySDK.onFinish(didWalletInfo)}
        />
        <Unlock
          open={unlockOpen}
          value={password}
          isWrongPassword={isWrongPassword}
          onChange={setPassword}
          onCancel={() => portkeySDK.onCancel()}
          onUnlock={onUnlockInternal}
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
