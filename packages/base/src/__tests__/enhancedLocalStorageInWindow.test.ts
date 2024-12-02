beforeEach(() => {
  vi.spyOn(console, 'log');
  (global as any).window = {};
});
afterEach(() => {
  vi.unmock('console.log');
  delete (global as any).window;
});

describe('localStorageMock in window', () => {
  it('enhancedLocalStorage should be set to localStorage in browser environment', async () => {
    await import('../enhancedLocalStorage');
    expect(console.log).toHaveBeenCalledWith('enhancedLocalStorage in window');
  });
});
