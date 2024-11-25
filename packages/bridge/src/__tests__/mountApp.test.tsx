import { renderHook } from '@testing-library/react-hooks';
import { render, screen } from '@testing-library/react';
import { useMountSignIn } from '../mountApp';
import { Bridge } from '../bridge';
import { NetworkEnum, WalletAdapter } from '@aelf-web-login/wallet-adapter-base';
import { IBaseConfig } from '../index';
import '@testing-library/jest-dom';

// Mock components and dependencies
jest.mock('../ui', () => jest.fn(() => <div>SignInModal Component</div>));

jest.mock('@portkey/did-ui-react', () => ({
  PortkeyProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('useMountSignIn', () => {
  let bridgeInstance: Bridge;
  let wallets: WalletAdapter[];
  let baseConfig: IBaseConfig;
  let children: React.ReactNode;

  beforeEach(() => {
    bridgeInstance = {} as Bridge;
    wallets = [{} as WalletAdapter];
    baseConfig = {
      PortkeyProviderProps: {},
      networkType: NetworkEnum.TESTNET,
    } as IBaseConfig;
    children = <div>Child Component</div>;
  });

  it('should render the SignInModal and children wrapped in PortkeyProvider', () => {
    const { result } = renderHook(() =>
      useMountSignIn(bridgeInstance, wallets, baseConfig, children),
    );

    const SignInNode = result.current;

    render(SignInNode);

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('should memoize the rendered component', () => {
    const { result, rerender } = renderHook(() =>
      useMountSignIn(bridgeInstance, wallets, baseConfig, children),
    );

    const firstRender = result.current;

    rerender();

    const secondRender = result.current;

    expect(firstRender).toBe(secondRender);
  });
});
