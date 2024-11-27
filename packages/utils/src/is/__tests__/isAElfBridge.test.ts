import { isAElfBridge } from '../isAElfBridge';
import { AElfDappBridge } from '@aelf-react/types';

describe('test isAElfBridge', () => {
  it('return true when contain options and connect', () => {
    const aelfBridge = {
      options: {
        rpcUrl: 'test',
        chainId: 'test',
      },
      connect: vi.fn(),
    };
    expect(isAElfBridge(aelfBridge as unknown as AElfDappBridge)).toBeTruthy();
  });

  it('return false when miss options and connect', () => {
    const aelfBridge = {
      connect: vi.fn(),
    };
    expect(isAElfBridge(aelfBridge as unknown as AElfDappBridge)).toBeFalsy();
  });
});
