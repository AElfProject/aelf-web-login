import { Loading } from '../Loading';

// Mock ReactDOM to prevent concurrent rendering issues
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

describe('Loading class', () => {
  let loadingInstance: Loading;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
    loadingInstance = new Loading(<div data-testid="loading-component">Loading content</div>);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Ensure cleanup
    if (loadingInstance) {
      loadingInstance.hide();
    }
    document.body.innerHTML = '';
  });

  it('should create container and show loading', () => {
    loadingInstance.show();

    // Check that container was created
    expect(document.body.children.length).toBeGreaterThan(0);
  });

  it('should hide loading and remove container', () => {
    loadingInstance.show();
    loadingInstance.hide();

    // Check that container was removed
    expect(document.body.children.length).toBe(0);
  });

  it('should render with updated content', () => {
    const newLoadingInstance = new Loading(<div data-testid="loading-component">New content</div>);
    newLoadingInstance.show();

    // Check that container was created
    expect(document.body.children.length).toBeGreaterThan(0);

    // Cleanup
    newLoadingInstance.hide();
  });
});
