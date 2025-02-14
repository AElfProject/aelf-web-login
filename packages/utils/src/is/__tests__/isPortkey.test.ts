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
});
