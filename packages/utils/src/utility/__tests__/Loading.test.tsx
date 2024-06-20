/** @jest-environment jsdom */
import { screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Loading } from '../Loading';

describe('Loading class', () => {
  let loadingInstance: Loading;

  beforeEach(() => {
    loadingInstance = new Loading(<div data-testid="loading-component">Loading content</div>);
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should create container and show loading', async () => {
    await act(() => {
      loadingInstance.show();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading-component')).toBeInTheDocument();
      expect(screen.getByTestId('loading-component')).toHaveTextContent('Loading content');
    });
  });

  it('should hide loading and remove container', async () => {
    await act(() => {
      loadingInstance.show();
      loadingInstance.hide();
    });

    expect(screen.queryByTestId('loading-component')).not.toBeInTheDocument();
  });

  it('should render with updated content', async () => {
    const newLoadingInstance = new Loading(<div data-testid="loading-component">New content</div>);
    await act(() => {
      newLoadingInstance.show();
    });

    expect(screen.getByTestId('loading-component')).toHaveTextContent('New content');
  });
});
