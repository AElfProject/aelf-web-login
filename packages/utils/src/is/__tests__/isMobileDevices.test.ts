// @environment happy-dom
import { isMobileDevices } from '../isMobileDevices';
import type DetachedWindowAPI from 'happy-dom/lib/window/DetachedWindowAPI.js';

declare global {
  const happyDOM: DetachedWindowAPI;
}
const originalNavigator = happyDOM.settings.navigator;

beforeEach(() => {
  // nothing to do here, happyDOM is already set up
});

afterEach(() => {
  happyDOM.settings.navigator = originalNavigator;
});

describe('isMobileDevices', () => {
  it('returns true for mobile user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('returns false for desktop user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });
});
