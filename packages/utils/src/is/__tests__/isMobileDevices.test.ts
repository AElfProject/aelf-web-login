import { isMobileDevices } from '../isMobileDevices';

describe('isMobileDevices', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    global.navigator = {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    } as Navigator;
  });

  afterEach(() => {
    global.navigator = originalNavigator;
  });

  test('returns true for mobile user agent', () => {
    expect(isMobileDevices()).toBe(true);
  });

  test('returns false for desktop user agent', () => {
    global.navigator = {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });
});
