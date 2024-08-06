import { render, screen } from '@testing-library/react';
import { WebLoginProvider, WebLoginContext } from '../index';

const mockBridgeAPI = {
  getSignIn: jest.fn((children) => children),
};

// describe('WebLoginProvider', () => {
//   it('should render children with provided bridgeAPI', () => {
//     render(
//       <WebLoginProvider bridgeAPI={mockBridgeAPI}>
//         <div>Test Child</div>
//       </WebLoginProvider>>
//     );
//     expect(screen.getByText('Test Child')).toBeInTheDocument();
//   });

//   it('should return null if no bridgeAPI is provided', () => {
//     const { container } = render(
//       <WebLoginProvider bridgeAPI={null}>
//         <div>Test Child</div>
//       </WebLoginProvider>
//     );
//     expect(container.firstChild).toBeNull();
//   });
// });
