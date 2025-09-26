import { isPortkeyApp } from '../isPortkeyApp';
beforeEach(() => {
  (global as any).window = {
    document: {
      body: {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      language: 'en-US',
    },
    location: {
      href: '',
      reload: vi.fn(),
      replace: vi.fn(),
    },
  };
});
afterEach(() => {
  delete (global as any).window;
});

describe('isPortkey in SSR', () => {
  it('should return undefined when in SSR', () => {
    const result = isPortkeyApp();
    expect(result).toBeFalsy();
  });
});

describe('isPortkey in window', () => {
  it('should return false when not in Portkey environment', () => {
    const result = isPortkeyApp();
    expect(result).toBeFalsy();
  });

  it('should return true when in Portkey environment', () => {
    (global as any).window = {
      navigator: {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36 Portkey',
      },
    };
    const result = isPortkeyApp();
    expect(result).toBe(true);
  });

  it('should return false when userAgent does not contain Portkey', () => {
    (global as any).window = {
      navigator: {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
      },
    };
    const result = isPortkeyApp();
    expect(result).toBe(false);
  });

  it('should return false when userAgent is empty', () => {
    (global as any).window = {
      navigator: {
        userAgent: '',
      },
    };
    const result = isPortkeyApp();
    expect(result).toBe(false);
  });

  it('should return false when userAgent is undefined', () => {
    (global as any).window = {
      navigator: {
        userAgent: undefined,
      },
    };
    const result = isPortkeyApp();
    expect(result).toBe(false);
  });

  it('should return false when navigator is undefined', () => {
    (global as any).window = {
      navigator: undefined,
    };
    const result = isPortkeyApp();
    expect(result).toBe(false);
  });

  it('should return false when window is undefined', () => {
    delete (global as any).window;
    const result = isPortkeyApp();
    expect(result).toBe(false);
  });
});
