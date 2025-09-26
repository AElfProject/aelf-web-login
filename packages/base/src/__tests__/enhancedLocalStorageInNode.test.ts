import { localStorageMock, enhancedLocalStorage } from '../enhancedLocalStorage';

describe('localStorageMock in node', () => {
  beforeEach(async () => {
    localStorageMock.clear();
  });

  it('should correctly set and get items', () => {
    const testKey = 'testKey';
    const testValue = 'testValue';

    enhancedLocalStorage.setItem(testKey, testValue);
    expect(enhancedLocalStorage.getItem(testKey)).toBe(testValue);
  });

  it('should remove items correctly', () => {
    const testKey = 'testKey';
    const testValue = 'testValue';

    enhancedLocalStorage.setItem(testKey, testValue);
    expect(enhancedLocalStorage.getItem(testKey)).toBe(testValue);

    enhancedLocalStorage.removeItem(testKey);
    expect(enhancedLocalStorage.getItem(testKey)).toBeNull();
  });

  it('should handle non-string values by converting them to strings', () => {
    const testKey = 'testKey';
    const testValue = { data: 'value' };

    enhancedLocalStorage.setItem(testKey, JSON.stringify(testValue));
    expect(enhancedLocalStorage.getItem(testKey)).toBe(JSON.stringify(testValue));
  });

  it('should return null when trying to get an item that does not exist', () => {
    const testKey = 'nonExistentKey';
    expect(enhancedLocalStorage.getItem(testKey)).toBeNull();
  });

  it('should clear all items', () => {
    const testKey1 = 'testKey1';
    const testKey2 = 'testKey2';
    const testValue = 'testValue';

    enhancedLocalStorage.setItem(testKey1, testValue);
    enhancedLocalStorage.setItem(testKey2, testValue);
    expect(enhancedLocalStorage.getItem(testKey1)).toBe(testValue);
    expect(enhancedLocalStorage.getItem(testKey2)).toBe(testValue);

    enhancedLocalStorage.clear();
    expect(enhancedLocalStorage.getItem(testKey1)).toBeNull();
    expect(enhancedLocalStorage.getItem(testKey2)).toBeNull();
  });

  it('should handle empty string values', () => {
    const testKey = 'emptyKey';
    const emptyValue = '';

    enhancedLocalStorage.setItem(testKey, emptyValue);
    expect(enhancedLocalStorage.getItem(testKey)).toBe(emptyValue);
  });

  it('should handle null and undefined values by converting to string', () => {
    const testKey1 = 'nullKey';
    const testKey2 = 'undefinedKey';

    enhancedLocalStorage.setItem(testKey1, null as any);
    enhancedLocalStorage.setItem(testKey2, undefined as any);

    expect(enhancedLocalStorage.getItem(testKey1)).toBe('null');
    expect(enhancedLocalStorage.getItem(testKey2)).toBe('undefined');
  });

  it('should handle number values by converting to string', () => {
    const testKey = 'numberKey';
    const numberValue = 123;

    enhancedLocalStorage.setItem(testKey, numberValue as any);
    expect(enhancedLocalStorage.getItem(testKey)).toBe('123');
  });

  it('should handle boolean values by converting to string', () => {
    const testKey1 = 'trueKey';
    const testKey2 = 'falseKey';

    enhancedLocalStorage.setItem(testKey1, true as any);
    enhancedLocalStorage.setItem(testKey2, false as any);

    expect(enhancedLocalStorage.getItem(testKey1)).toBe('true');
    expect(enhancedLocalStorage.getItem(testKey2)).toBe('false');
  });

  it('should handle object values by converting to string', () => {
    const testKey = 'objectKey';
    const objectValue = { name: 'test', value: 123 };

    enhancedLocalStorage.setItem(testKey, objectValue as any);
    expect(enhancedLocalStorage.getItem(testKey)).toBe('[object Object]');
  });

  it('should return null for non-existent keys', () => {
    expect(enhancedLocalStorage.getItem('nonExistentKey')).toBeNull();
    expect(enhancedLocalStorage.getItem('')).toBeNull();
  });

  it('should handle removeItem for non-existent keys', () => {
    // Should not throw error when removing non-existent key
    expect(() => {
      enhancedLocalStorage.removeItem('nonExistentKey');
    }).not.toThrow();
  });

  it('should handle multiple operations on same key', () => {
    const testKey = 'multiKey';
    const value1 = 'value1';
    const value2 = 'value2';

    // Set initial value
    enhancedLocalStorage.setItem(testKey, value1);
    expect(enhancedLocalStorage.getItem(testKey)).toBe(value1);

    // Overwrite with new value
    enhancedLocalStorage.setItem(testKey, value2);
    expect(enhancedLocalStorage.getItem(testKey)).toBe(value2);

    // Remove the key
    enhancedLocalStorage.removeItem(testKey);
    expect(enhancedLocalStorage.getItem(testKey)).toBeNull();

    // Set again after removal
    enhancedLocalStorage.setItem(testKey, value1);
    expect(enhancedLocalStorage.getItem(testKey)).toBe(value1);
  });
});
