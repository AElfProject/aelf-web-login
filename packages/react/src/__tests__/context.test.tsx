import { render, screen } from '@testing-library/react';
import { WebLoginProvider } from '../context';
import config from '../data/config';

describe('WebLoginProvider', () => {
  it('should render children with provided config', () => {
    const a = render(
      <WebLoginProvider config={config}>
        <div>with provided config</div>
      </WebLoginProvider>,
    );
    a.debug();
    expect(screen.getByText('with provided config')).toBeInTheDocument();
  });

  it('should throw an error if no config is provided', () => {
    const renderWithNoConfig = () =>
      render(
        <WebLoginProvider config={undefined as any}>
          <div>Test Child</div>
        </WebLoginProvider>,
      );

    expect(renderWithNoConfig).toThrow(/baseConfig/);
  });
});
