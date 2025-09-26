import { isPortkeyApp } from '../utils/isPortkeyApp';

describe('isPortkeyApp', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset window object
    delete (global as any).window;
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
  });

  it('should return false when window is not available', () => {
    expect(isPortkeyApp()).toBe(false);
  });

  it('should return false when window is not an object', () => {
    (global as any).window = 'not an object';
    expect(isPortkeyApp()).toBe(false);
  });

  it('should return true when userAgent includes Portkey', () => {
    (global as any).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (compatible; Portkey/1.0)',
      },
    };
    expect(isPortkeyApp()).toBe(true);
  });

  it('should return false when userAgent does not include Portkey', () => {
    (global as any).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };
    expect(isPortkeyApp()).toBe(false);
  });

  it('should handle case sensitivity', () => {
    (global as any).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (compatible; portkey/1.0)',
      },
    };
    expect(isPortkeyApp()).toBe(false);
  });

  it('should return true when Portkey appears anywhere in userAgent', () => {
    (global as any).window = {
      navigator: {
        userAgent: 'SomeApp/1.0 Portkey Mobile/2.0',
      },
    };
    expect(isPortkeyApp()).toBe(true);
  });
});
