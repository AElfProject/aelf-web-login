import { NetworkEnum } from '@aelf-web-login/wallet-adapter-base';
import { init } from '../init';
import { type IConfigProps, initBridge } from '@aelf-web-login/wallet-adapter-bridge';
import VConsole from 'vconsole';

const baseOptions: IConfigProps = {
  baseConfig: {
    showVconsole: true,
    networkType: NetworkEnum.TESTNET,
    chainId: 'tDVV',
    sideChainId: 'tDVW',
    appName: 'test-app',
  },
  wallets: [],
};

describe('init', () => {
  it('should initialize VConsole if showVconsole is true', async () => {
    const options: IConfigProps = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, showVconsole: true },
    };
    init(options);
    // workaround for rare race condition where VConsole is being initiated but init() already returns
    // and assertion runs
    await new Promise<void>((r) => {
      setTimeout(() => {
        expect(VConsole).toHaveBeenCalled();
        r();
      }, 10);
    });
  });
  it('should not initialize VConsole if showVconsole is false', async () => {
    const options = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, showVconsole: false },
    };
    init(options);
    expect(VConsole).not.toHaveBeenCalled();
  });

  it('should call initBridge with the given options', async () => {
    const options = {
      ...baseOptions,
      baseConfig: { ...baseOptions.baseConfig, showVconsole: false },
    };
    init(options);
    expect(initBridge).toHaveBeenCalledWith(options);
  });
});
