import { Storage, localStorageMock, enhancedLocalStorage } from '../enhancedLocalStorage';

describe('enhancedLocalStorage exports', () => {
  it('should export Storage interface', () => {
    // Test that Storage interface is properly exported
    const mockStorage: Storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    expect(typeof mockStorage.getItem).toBe('function');
    expect(typeof mockStorage.setItem).toBe('function');
    expect(typeof mockStorage.removeItem).toBe('function');
    expect(typeof mockStorage.clear).toBe('function');
  });

  it('should export localStorageMock', () => {
    expect(localStorageMock).toBeDefined();
    expect(typeof localStorageMock.getItem).toBe('function');
    expect(typeof localStorageMock.setItem).toBe('function');
    expect(typeof localStorageMock.removeItem).toBe('function');
    expect(typeof localStorageMock.clear).toBe('function');
  });

  it('should export enhancedLocalStorage', () => {
    expect(enhancedLocalStorage).toBeDefined();
    expect(typeof enhancedLocalStorage.getItem).toBe('function');
    expect(typeof enhancedLocalStorage.setItem).toBe('function');
    expect(typeof enhancedLocalStorage.removeItem).toBe('function');
    expect(typeof enhancedLocalStorage.clear).toBe('function');
  });

  it('should have localStorageMock as a proper mock implementation', () => {
    // Clear any existing data
    localStorageMock.clear();

    // Test basic functionality
    localStorageMock.setItem('test', 'value');
    expect(localStorageMock.getItem('test')).toBe('value');

    localStorageMock.removeItem('test');
    expect(localStorageMock.getItem('test')).toBeNull();

    localStorageMock.setItem('key1', 'value1');
    localStorageMock.setItem('key2', 'value2');
    localStorageMock.clear();
    expect(localStorageMock.getItem('key1')).toBeNull();
    expect(localStorageMock.getItem('key2')).toBeNull();
  });

  it('should handle Storage interface method signatures', () => {
    const storage: Storage = {
      getItem: (key: string, ...args: Array<any>) => {
        return 'test';
      },
      setItem: (key: string, value: any, ...args: Array<any>) => {
        // Mock implementation
      },
      removeItem: (key: string, ...args: Array<any>) => {
        // Mock implementation
      },
      clear: () => {
        // Mock implementation
      },
    };

    expect(storage.getItem('test')).toBe('test');
    expect(() => storage.setItem('key', 'value')).not.toThrow();
    expect(() => storage.removeItem('key')).not.toThrow();
    expect(() => storage.clear()).not.toThrow();
  });
});
