import { type TChainId } from '@aelf-web-login/wallet-adapter-base';
import { getCaContractBase, getIsManagerReadOnly } from '../utils';
import { getContractBasic } from '@portkey/contracts';
import { type Mock } from 'vitest';

afterEach(() => {
  vi.unmock('@portkey/contracts');
});
vi.mock('@portkey/contracts', () => ({
  getContractBasic: vi.fn(),
}));

describe('getCaContractBase()', () => {
  it('should throw error about chain is not running', async () => {
    const chainId = null;
    try {
      await getCaContractBase(chainId as unknown as TChainId);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', `Chain is not running: ${chainId}`);
    }
  });
  it('should get back contract base', async () => {
    const chainId: TChainId = 'tDVW';
    const mockContractBase = {
      chainId,
      address: '',
    };
    (getContractBasic as Mock).mockImplementation(() => mockContractBase);
    const contractBase = await getCaContractBase(chainId);
    expect(contractBase).toMatchObject(mockContractBase);
  });
});

describe('getIsManagerReadOnly()', () => {
  it('should throw error about chain is not running', async () => {
    const chainId = null;
    try {
      await getIsManagerReadOnly(chainId as unknown as TChainId);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', `Chain is not running: ${chainId}`);
    }
  });
  it('should return false', async () => {
    const r = await getIsManagerReadOnly('tDVV');
    expect(r).toBeFalsy();
  });
});
