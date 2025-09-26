import { isMobile, isMobileDevices, type IsMobileParameter } from '../utils/isMobile';

describe('isMobile', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset navigator
    delete (global as any).navigator;
  });

  afterEach(() => {
    // Restore original navigator
    global.navigator = originalNavigator;
  });

  it('should detect iPhone', () => {
    const result = isMobile('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
    expect(result.apple.phone).toBe(true);
    expect(result.phone).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should detect iPad', () => {
    const result = isMobile('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)');
    expect(result.apple.tablet).toBe(true);
    expect(result.tablet).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should detect Android phone', () => {
    const result = isMobile('Mozilla/5.0 (Linux; Android 10; Mobile; SM-G975F) AppleWebKit/537.36');
    expect(result.android.phone).toBe(true);
    expect(result.phone).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should detect Android tablet', () => {
    const result = isMobile('Mozilla/5.0 (Linux; Android 10; SM-T970) AppleWebKit/537.36');
    expect(result.android.tablet).toBe(true);
    expect(result.tablet).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should detect Windows Phone', () => {
    const result = isMobile('Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0)');
    expect(result.windows.phone).toBe(true);
    expect(result.phone).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should detect BlackBerry', () => {
    const result = isMobile('Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en)');
    expect(result.other.blackberry).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should detect Opera Mini', () => {
    const result = isMobile(
      'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54',
    );
    expect(result.other.opera).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should detect Chrome Mobile', () => {
    const result = isMobile(
      'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    );
    expect(result.other.chrome).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should detect Firefox Mobile', () => {
    const result = isMobile('Mozilla/5.0 (Mobile; rv:68.0) Gecko/68.0 Firefox/68.0');
    expect(result.other.firefox).toBe(true);
    expect(result.any).toBe(true);
  });

  it('should handle Navigator object parameter', () => {
    const navigator: IsMobileParameter = {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
    };
    const result = isMobile(navigator);
    expect(result.apple.phone).toBe(true);
    expect(result.phone).toBe(true);
  });

  it('should handle iPad on iOS 13+ with MacIntel platform', () => {
    const navigator: IsMobileParameter = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    };
    const result = isMobile(navigator);
    expect(result.apple.tablet).toBe(true);
    expect(result.tablet).toBe(true);
  });

  it('should filter out Facebook app strings', () => {
    const result = isMobile(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) [FBAN/EMA;FBAV/239.0.0.10.109;]',
    );
    expect(result.apple.phone).toBe(true);
    expect(result.phone).toBe(true);
  });

  it('should filter out Twitter app strings', () => {
    const result = isMobile(
      'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Twitter for iPhone',
    );
    expect(result.apple.tablet).toBe(true);
    expect(result.tablet).toBe(true);
  });

  it('should return false for desktop user agents', () => {
    const result = isMobile(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );
    expect(result.any).toBe(false);
    expect(result.phone).toBe(false);
    expect(result.tablet).toBe(false);
  });

  it('should use global navigator when no parameter provided', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      },
      writable: true,
      configurable: true,
    });
    const result = isMobile();
    expect(result.apple.phone).toBe(true);
    expect(result.phone).toBe(true);
  });
});

describe('isMobileDevices', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    delete (global as any).navigator;
  });

  afterEach(() => {
    global.navigator = originalNavigator;
  });

  it('should return true for Apple devices', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      },
      writable: true,
      configurable: true,
    });
    expect(isMobileDevices()).toBe(true);
  });

  it('should return true for Android devices', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Linux; Android 10; Mobile; SM-G975F) AppleWebKit/537.36',
        platform: 'Linux armv7l',
        maxTouchPoints: 5,
      },
      writable: true,
      configurable: true,
    });
    expect(isMobileDevices()).toBe(true);
  });

  it('should return false for desktop devices', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32',
        maxTouchPoints: 0,
      },
      writable: true,
      configurable: true,
    });
    expect(isMobileDevices()).toBe(false);
  });

  it('should return false for Windows Phone', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0)',
        platform: 'Windows Phone',
        maxTouchPoints: 5,
      },
      writable: true,
      configurable: true,
    });
    expect(isMobileDevices()).toBe(false);
  });
});
