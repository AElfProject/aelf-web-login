export const getOriginalAddress = (address: string) => {
  if (!address) return '';
  return address.replace(/^ELF_/, '').replace(/_.*$/, '');
};
