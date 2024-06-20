import { isPortkeyApp } from '../isPortkeyApp';

describe('isPortkey in SSR', () => {
  test('should return undefined when in SSR', () => {
    const result = isPortkeyApp();
    expect(result).toBeFalsy();
  });
});

describe('isPortkey in window', () => {
  beforeEach(() => {
    (global as any).window = {
      document: {
        body: {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      navigator: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        language: 'en-US',
      },
      location: {
        href: '',
        reload: jest.fn(),
        replace: jest.fn(),
      },
    };
  });
  afterEach(() => {
    delete (global as any).window;
  });
  test('should return false when not in Portkey environment', () => {
    const result = isPortkeyApp();
    expect(result).toBeFalsy();
  });
});
