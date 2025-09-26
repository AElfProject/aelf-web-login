import { isFairyVaultApp } from '../utils/isFairyVaultApp';

describe('isFairyVaultApp', () => {
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
    expect(isFairyVaultApp()).toBe(false);
  });

  it('should return false when window is not an object', () => {
    (global as any).window = 'not an object';
    expect(isFairyVaultApp()).toBe(false);
  });

  it('should return true when userAgent includes FairyVault', () => {
    (global as any).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (compatible; FairyVault/1.0)',
      },
    };
    expect(isFairyVaultApp()).toBe(true);
  });

  it('should return false when userAgent does not include FairyVault', () => {
    (global as any).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };
    expect(isFairyVaultApp()).toBe(false);
  });

  it('should handle case sensitivity', () => {
    (global as any).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (compatible; fairyvault/1.0)',
      },
    };
    expect(isFairyVaultApp()).toBe(false);
  });

  it('should return true when FairyVault appears anywhere in userAgent', () => {
    (global as any).window = {
      navigator: {
        userAgent: 'SomeApp/1.0 FairyVault Mobile/2.0',
      },
    };
    expect(isFairyVaultApp()).toBe(true);
  });
});
