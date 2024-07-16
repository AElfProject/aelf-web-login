import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function handleError(error: Error, info: React.ErrorInfo) {
  console.error('Error caught by ErrorBoundary:', error, info);
}

function ErrorFallback({ error }: { error: any }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

const CommonErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
    {children}
  </ErrorBoundary>
);

export default CommonErrorBoundary;
