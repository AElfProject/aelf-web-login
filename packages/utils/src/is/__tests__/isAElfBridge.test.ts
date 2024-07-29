import { isAElfBridge } from '../isAElfBridge';
import { AElfDappBridge } from '@aelf-react/types';

describe('test isAElfBridge', () => {
  test('return true when contain options and connect', () => {
    const aelfBridge = {
      options: {
        rpcUrl: 'test',
        chainId: 'test',
      },
      connect: jest.fn(),
    };
    expect(isAElfBridge(aelfBridge as unknown as AElfDappBridge)).toBeTruthy();
  });

  test('return false when miss options and connect', () => {
    const aelfBridge = {
      connect: jest.fn(),
    };
    expect(isAElfBridge(aelfBridge as unknown as AElfDappBridge)).toBeFalsy();
  });
});
