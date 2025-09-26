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
  it('returns true for iPhone user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('returns true for Android phone user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('returns true for Android tablet user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Linux; Android 10; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('returns true for iPad user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('returns true for iPod user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (iPod; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('returns false for Windows Phone user agent (not supported by isMobileDevices)', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('returns false for Windows tablet user agent (not supported by isMobileDevices)', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('returns false for BlackBerry user agent (not supported by isMobileDevices)', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en) AppleWebKit/534.1+ (KHTML, like Gecko) Version/6.0.0.337 Mobile Safari/534.1+',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('returns false for BB10 user agent (not supported by isMobileDevices)', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('returns false for Opera Mini user agent (not supported by isMobileDevices)', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('returns false for Mobile Firefox user agent (not supported by isMobileDevices)', () => {
    happyDOM.settings.navigator = {
      userAgent: 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('returns true for Mobile Chrome user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('returns true for okhttp user agent', () => {
    happyDOM.settings.navigator = {
      userAgent: 'okhttp/3.12.1',
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

  it('returns false for Windows desktop user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('returns false for Linux desktop user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('handles Facebook mobile app user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone12,1;FBMD/iPhone;FBSN/iOS;FBSV/13.0;FBSS/2;FBCR/Verizon;FBID/phone;FBLC/en_US;FBOP/5]',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('handles Twitter mobile app user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Twitter for iPhone',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('handles Amazon Silk user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Linux; U; en-us; KFAPWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('handles Amazon Silk Mobile user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Linux; U; en-us; KFJWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('handles iOS universal user agent', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1 iOS-universal Mac',
    } as Navigator;
    expect(isMobileDevices()).toBe(true);
  });

  it('handles iPad on iOS 13 with MacIntel platform', async () => {
    const { isMobile } = await import('../isMobileDevices');
    const navigator = {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 2,
    } as Navigator;

    const result = isMobile(navigator);
    expect(result.apple.device).toBe(true);
    expect(result.apple.tablet).toBe(true);
  });

  it('handles iPad on iOS 13 with MacIntel platform but no touch points', () => {
    happyDOM.settings.navigator = {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 0,
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('handles empty user agent', () => {
    happyDOM.settings.navigator = {
      userAgent: '',
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });

  it('handles undefined user agent', () => {
    happyDOM.settings.navigator = {
      userAgent: undefined as any,
    } as Navigator;
    expect(isMobileDevices()).toBe(false);
  });
});
