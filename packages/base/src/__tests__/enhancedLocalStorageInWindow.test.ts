const originalConsoleLog = console.log;

describe('localStorageMock in window', () => {
  beforeEach(() => {
    console.log = vi.fn();
    (global as any).window = {};
  });
  afterEach(() => {
    console.log = originalConsoleLog;
    delete (global as any).window;
  });

  it('enhancedLocalStorage should be set to localStorage in browser environment', async () => {
    await import('../enhancedLocalStorage');
    expect(console.log).toHaveBeenCalledWith('enhancedLocalStorage in window');
  });
});
