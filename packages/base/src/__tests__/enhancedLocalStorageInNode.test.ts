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
});
