import { type TChainId } from '@aelf-web-login/wallet-adapter-base';
import { getCaContractBase } from './utils';

describe('getCaContractBase()', () => {
  it('should throw error if no chainId', async () => {
    const chainId: TChainId = 'tDVV';
    try {
      await getCaContractBase(chainId);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', `Chain is not running: ${chainId}`);
    }
  });
});
