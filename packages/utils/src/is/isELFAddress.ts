import AElf from 'aelf-sdk';

function isELFAddress(value: string) {
  if (/[\u4e00-\u9fa5]/.test(value)) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
}

export { isELFAddress };
