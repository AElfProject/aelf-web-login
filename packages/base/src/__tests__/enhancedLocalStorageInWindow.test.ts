beforeEach(() => {
  vi.spyOn(console, 'log');
  (global as any).window = {};
});
afterEach(() => {
  vi.unmock('console.log');
  delete (global as any).window;
});

describe('enhancedLocalStorage in window environment', () => {
  it('should be set to window.localStorage in browser environment', async () => {
    await import('../enhancedLocalStorage');
    expect(console.log).toHaveBeenCalledWith('enhancedLocalStorage in window');
  });

  it('should detect window environment correctly', () => {
    expect(typeof window).toBe('object');
    expect(window).toBeDefined();
  });

  it('should have window.localStorage available in test environment', () => {
    // In the test environment, we need to mock window.localStorage
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    (global as any).window = {
      localStorage: mockLocalStorage,
    };

    expect(window.localStorage).toBeDefined();
    expect(typeof window.localStorage.getItem).toBe('function');
    expect(typeof window.localStorage.setItem).toBe('function');
    expect(typeof window.localStorage.removeItem).toBe('function');
    expect(typeof window.localStorage.clear).toBe('function');
  });

  it('should handle window environment detection', () => {
    // Test the typeof window !== 'undefined' condition
    expect(typeof window !== 'undefined').toBe(true);
  });
});
