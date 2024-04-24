import React from 'react';
import { createRoot } from 'react-dom/client';

import { DemoButton } from './ui';

export function mountApp(bridgeInstance: any) {
  const containerElementQuery = 'body';
  const containerElement = document.querySelector(containerElementQuery);
  if (!containerElement) {
    throw new Error(`Element with query ${containerElementQuery} does not exist.`);
  }
  const root = createRoot(containerElement);
  root.render(<DemoButton bridgeInstance={bridgeInstance} />);
}

// export {mountApp}
