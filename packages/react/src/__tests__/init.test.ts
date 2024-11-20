// import { initBridge, IConfigProps, IBridgeAPI } from '@aelf-web-login/wallet-adapter-bridge';
import { init } from '../index';

jest.mock('vconsole');
jest.mock('@aelf-web-login/wallet-adapter-bridge', () => ({
  initBridge: jest.fn(),
}));

describe('init', () => {
  it('should initialize VConsole if showVconsole is true', async () => {
    const options = { baseConfig: { showVconsole: true } };
    init(options as any);
    const VConsole = await import('vconsole');
    expect(VConsole).toHaveBeenCalled();
  });
  it('should not initialize VConsole if showVconsole is false', async () => {
    const options = { baseConfig: { showVconsole: false } };
    init(options as any);
    const VConsole = await import('vconsole');
    expect(VConsole).not.toHaveBeenCalled();
  });

  it('should call initBridge with the given options', async () => {
    const options = { baseConfig: { showVconsole: false } };
    const { initBridge } = await import('@aelf-web-login/wallet-adapter-bridge');
    init(options as any);
    expect(initBridge).toHaveBeenCalledWith(options);
  });
});
