import { decodeAddress } from '../decodeAddress';
import AElf from 'aelf-sdk';

// Mock AElf.utils.decodeAddressRep to avoid actual decoding during tests
jest.mock('aelf-sdk', () => {
  return {
    utils: {
      decodeAddressRep: jest.fn(),
    },
  };
});

describe('decodeAddress', () => {
  beforeEach(() => {
    (AElf.utils.decodeAddressRep as jest.Mock).mockClear();
  });

  it('should return false when address is empty', () => {
    expect(decodeAddress('')).toBeFalsy();
  });

  it('should return false when address contains invalid characters', () => {
    expect(decodeAddress('invalid!address')).toBeFalsy();
  });

  it('should call AElf.utils.decodeAddressRep correctly when address starts with "ELF_"', () => {
    expect(
      decodeAddress('ELF_rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk_tDVW'),
    ).toBeTruthy();
  });

  it('should return false when address does not start with "ELF_"', () => {
    expect(decodeAddress('AA_rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk')).toBeFalsy();
  });

  it('should call AElf.utils.decodeAddressRep correctly when address is valid and not start with "ELF_"', () => {
    expect(decodeAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk')).toBeTruthy();
  });

  it('should return false when AElf.utils.decodeAddressRep throws an error', () => {
    (AElf.utils.decodeAddressRep as jest.Mock).mockImplementation(() => {
      throw new Error('Decoding failed');
    });
    expect(decodeAddress('validAddress')).toBe(false);
  });
});
