import AElf from 'aelf-sdk';
export const decodeAddress = (address: string) => {
  try {
    if (!address) return false;
    if (!/[0-9a-zA-Z]/.test(address)) return false;
    if (address.includes('_')) {
      const parts = address.split('_');
      if (parts[0] !== 'ELF') return false;

      const addressPart = address.startsWith('ELF') ? parts[1] : parts[0];
      AElf.utils.decodeAddressRep(addressPart);
    } else {
      AElf.utils.decodeAddressRep(address);
    }
    return true;
  } catch (error) {
    return false;
  }
};
