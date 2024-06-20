import { isPortkey } from '../isPortkey';

describe('isPortkey in SSR', () => {
  test('should return undefined when in SSR', () => {
    const result = isPortkey();
    expect(result).toBeUndefined();
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
    const result = isPortkey();
    expect(result).toBeFalsy();
  });
});
